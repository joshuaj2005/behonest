import io from 'socket.io-client';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.screenStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.callbacks = {
      onRemoteStream: null,
      onCallEnded: null,
      onCallAccepted: null,
      onCallRejected: null,
      onScreenShareStarted: null,
      onScreenShareEnded: null,
      onRecordingStarted: null,
      onRecordingEnded: null
    };
  }

  initialize() {
    this.socket = io(process.env.REACT_APP_SERVER_URL);
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('call:signal', async (data) => {
      if (data.type === 'offer') {
        await this.handleOffer(data);
      } else if (data.type === 'answer') {
        await this.handleAnswer(data);
      } else if (data.type === 'ice-candidate') {
        await this.handleIceCandidate(data);
      }
    });

    this.socket.on('call:accepted', () => {
      if (this.callbacks.onCallAccepted) {
        this.callbacks.onCallAccepted();
      }
    });

    this.socket.on('call:rejected', () => {
      if (this.callbacks.onCallRejected) {
        this.callbacks.onCallRejected();
      }
      this.endCall();
    });

    this.socket.on('call:ended', () => {
      if (this.callbacks.onCallEnded) {
        this.callbacks.onCallEnded();
      }
      this.endCall();
    });
  }

  async startCall(targetUserId, isVideo = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });

      this.createPeerConnection();
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      this.socket.emit('call:signal', {
        targetId: targetUserId,
        type: 'offer',
        sdp: offer
      });

      return this.localStream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in peer connection
      const videoTrack = this.screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video');
      await sender.replaceTrack(videoTrack);

      if (this.callbacks.onScreenShareStarted) {
        this.callbacks.onScreenShareStarted(this.screenStream);
      }

      // Handle screen share stop
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;

      // Restore original video track
      const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video');
      const originalTrack = this.localStream.getVideoTracks()[0];
      await sender.replaceTrack(originalTrack);

      if (this.callbacks.onScreenShareEnded) {
        this.callbacks.onScreenShareEnded();
      }
    }
  }

  async startRecording() {
    if (!this.remoteStream) return;

    try {
      const combinedStream = new MediaStream([
        ...this.localStream.getTracks(),
        ...this.remoteStream.getTracks()
      ]);

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        this.saveRecording(url);
      };

      this.mediaRecorder.start();
      if (this.callbacks.onRecordingStarted) {
        this.callbacks.onRecordingStarted();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      if (this.callbacks.onRecordingEnded) {
        this.callbacks.onRecordingEnded();
      }
    }
  }

  async saveRecording(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('recording', blob, `call-recording-${Date.now()}.webm`);

      await fetch('/api/calls/recordings', {
        method: 'POST',
        body: formData
      });

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving recording:', error);
      throw error;
    }
  }

  async handleOffer(data) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      this.createPeerConnection();
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit('call:signal', {
        targetId: data.from,
        type: 'answer',
        sdp: answer
      });

      return this.localStream;
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async handleAnswer(data) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(data) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      throw error;
    }
  }

  createPeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('call:signal', {
          targetId: this.currentCallTarget,
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(this.remoteStream);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    };
  }

  acceptCall() {
    this.socket.emit('call:accepted', { targetId: this.currentCallTarget });
  }

  rejectCall() {
    this.socket.emit('call:rejected', { targetId: this.currentCallTarget });
    this.endCall();
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    if (this.mediaRecorder) {
      this.stopRecording();
      this.mediaRecorder = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.socket.emit('call:ended', { targetId: this.currentCallTarget });
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }
}

export default new WebRTCService(); 