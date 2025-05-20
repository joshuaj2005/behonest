import { useRef, useEffect, useState } from 'react';
import { IconButton, TextField, Avatar } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import './Chat.css';

const Chat = () => {
  const fileInputRef = useRef(null);
  const [isInputReady, setIsInputReady] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How are you?",
      sent: false,
      time: "10:00 AM",
      user: {
        name: "John",
        avatar: "https://mui.com/static/images/avatar/1.jpg"
      }
    },
    {
      id: 2,
      text: "I'm doing great, thanks!",
      sent: true,
      time: "10:01 AM",
      user: {
        name: "You",
        avatar: "https://mui.com/static/images/avatar/2.jpg"
      }
    }
  ]);

  useEffect(() => {
    const checkFileInput = () => {
      if (fileInputRef.current) {
        setIsInputReady(true);
      } else {
        setIsInputReady(false);
      }
    };

    // Initial check
    checkFileInput();
    
    // Check again after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkFileInput, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleUploadClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Delay the click to ensure the input is ready
    setTimeout(() => {
      if (fileInputRef?.current) {
        try {
          fileInputRef.current.click();
        } catch (error) {
          console.error('Error triggering file input:', error);
        }
      }
    }, 0);
  };

  const handleFileChange = (event) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        console.log('File selected:', file);
        // Add file preview logic here
      }
    } catch (error) {
      console.error('Error handling file:', error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: {
          name: "You",
          avatar: "https://mui.com/static/images/avatar/2.jpg"
        }
      }]);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar src="https://mui.com/static/images/avatar/1.jpg" />
          <div>
            <h3 style={{ margin: 0 }}>Chat Room</h3>
            <span style={{ color: '#8e8e8e', fontSize: '0.9rem' }}>Online</span>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sent ? 'message-sent' : 'message-received'}`}>
            {!msg.sent && <Avatar src={msg.user.avatar} />}
            <div className="message-content">
              {msg.text}
              <div className="message-time">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-controls">
        <div className="chat-input">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onClick={(e) => e.stopPropagation()}
          />
          
          <IconButton 
            onClick={handleUploadClick}
            disabled={!isInputReady}
          >
            <AttachFileIcon />
          </IconButton>
          
          <TextField
            fullWidth
            variant="standard"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            InputProps={{
              disableUnderline: true,
              style: { fontSize: '0.95rem' }
            }}
          />
          
          <IconButton>
            <EmojiEmotionsIcon />
          </IconButton>
          
          <IconButton onClick={handleSendMessage} disabled={!message.trim()}>
            <SendIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Chat; 