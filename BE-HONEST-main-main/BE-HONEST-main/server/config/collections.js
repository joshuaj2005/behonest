const { db } = require('./firebase');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } = require('firebase/firestore');

// Collection references
const usersRef = collection(db, 'users');
const chatsRef = collection(db, 'chats');
const messagesRef = collection(db, 'messages');
const reelsRef = collection(db, 'reels');
const storiesRef = collection(db, 'stories');
const gamesRef = collection(db, 'games');

// User operations
const userOperations = {
  async createUser(userId, userData) {
    await setDoc(doc(usersRef, userId), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  async getUser(userId) {
    const userDoc = await getDoc(doc(usersRef, userId));
    return userDoc.exists() ? userDoc.data() : null;
  },

  async updateUser(userId, userData) {
    await updateDoc(doc(usersRef, userId), {
      ...userData,
      updatedAt: new Date()
    });
  }
};

// Chat operations
const chatOperations = {
  async createChat(chatData) {
    const chatRef = doc(chatsRef);
    await setDoc(chatRef, {
      ...chatData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return chatRef.id;
  },

  async getChat(chatId) {
    const chatDoc = await getDoc(doc(chatsRef, chatId));
    return chatDoc.exists() ? chatDoc.data() : null;
  },

  async updateChat(chatId, chatData) {
    await updateDoc(doc(chatsRef, chatId), {
      ...chatData,
      updatedAt: new Date()
    });
  }
};

// Message operations
const messageOperations = {
  async createMessage(messageData) {
    const messageRef = doc(messagesRef);
    await setDoc(messageRef, {
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return messageRef.id;
  },

  async getMessages(chatId) {
    const q = query(messagesRef, where('chatId', '==', chatId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// Reel operations
const reelOperations = {
  async createReel(reelData) {
    const reelRef = doc(reelsRef);
    await setDoc(reelRef, {
      ...reelData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return reelRef.id;
  },

  async getReel(reelId) {
    const reelDoc = await getDoc(doc(reelsRef, reelId));
    return reelDoc.exists() ? reelDoc.data() : null;
  }
};

// Story operations
const storyOperations = {
  async createStory(storyData) {
    const storyRef = doc(storiesRef);
    await setDoc(storyRef, {
      ...storyData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    return storyRef.id;
  },

  async getStories(userId) {
    const q = query(storiesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// Game operations
const gameOperations = {
  async createGame(gameData) {
    const gameRef = doc(gamesRef);
    await setDoc(gameRef, {
      ...gameData,
      createdAt: new Date(),
      status: 'waiting'
    });
    return gameRef.id;
  },

  async getGame(gameId) {
    const gameDoc = await getDoc(doc(gamesRef, gameId));
    return gameDoc.exists() ? gameDoc.data() : null;
  }
};

module.exports = {
  userOperations,
  chatOperations,
  messageOperations,
  reelOperations,
  storyOperations,
  gameOperations
}; 