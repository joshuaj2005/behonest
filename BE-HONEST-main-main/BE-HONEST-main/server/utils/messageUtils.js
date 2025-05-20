const { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, updateDoc, doc } = require('firebase/firestore');
const { db } = require('../config/firebase');

/**
 * Saves a message to Firestore
 * @param {string} messageText - The text content of the message
 * @param {string} userId - The ID of the user sending the message
 * @param {string} type - The type of message (text, image, video, etc.)
 * @param {string} chatId - The ID of the chat/room where the message belongs
 * @returns {Promise<string>} - The ID of the created document
 */
const saveMessage = async (messageText, userId, type = 'text', chatId) => {
  try {
    const messagesRef = collection(db, 'messages');
    const docRef = await addDoc(messagesRef, {
      text: messageText,
      userId: userId,
      type: type,
      chatId: chatId,
      status: 'sent',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      readBy: [userId],
      metadata: {
        isEdited: false,
        isDeleted: false,
        attachments: []
      }
    });
    
    console.log('Message saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Get messages for a specific chat
 * @param {string} chatId - The ID of the chat to get messages for
 * @param {number} limit - Maximum number of messages to return
 * @returns {Promise<Array>} - Array of messages
 */
const getChatMessages = async (chatId, limit = 50) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      where('metadata.isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    return messages.slice(0, limit);
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Update message status (sent, delivered, read)
 * @param {string} messageId - The ID of the message to update
 * @param {string} status - New status of the message
 * @param {string} userId - ID of the user who performed the action
 * @returns {Promise<void>}
 */
const updateMessageStatus = async (messageId, status, userId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const updates = {
      status: status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'read' && userId) {
      updates.readBy = [userId];
    }
    
    await updateDoc(messageRef, updates);
    console.log('Message status updated successfully');
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

/**
 * Edit an existing message
 * @param {string} messageId - The ID of the message to edit
 * @param {string} newText - The new text content
 * @returns {Promise<void>}
 */
const editMessage = async (messageId, newText) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      text: newText,
      'metadata.isEdited': true,
      updatedAt: serverTimestamp()
    });
    console.log('Message edited successfully');
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Soft delete a message
 * @param {string} messageId - The ID of the message to delete
 * @returns {Promise<void>}
 */
const deleteMessage = async (messageId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      'metadata.isDeleted': true,
      updatedAt: serverTimestamp()
    });
    console.log('Message deleted successfully');
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

module.exports = {
  saveMessage,
  getChatMessages,
  updateMessageStatus,
  editMessage,
  deleteMessage
}; 