const sampleUsers = [
  {
    id: 'user1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: 'user2',
    name: 'Mike Chen',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000),
  },
  {
    id: 'user3',
    name: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: 'user4',
    name: 'Alex Kumar',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    status: 'away',
    lastSeen: new Date(Date.now() - 1800000),
  },
  {
    id: 'user5',
    name: 'Lisa Park',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    status: 'online',
    lastSeen: new Date(),
  }
];

const sampleMessages = [
  {
    id: 'msg1',
    senderId: 'user1',
    receiverId: 'currentUser',
    type: 'text',
    content: 'Hey! How are you? 😊',
    timestamp: new Date(Date.now() - 86400000),
    reactions: ['❤️', '👍'],
    hasRead: true
  },
  {
    id: 'msg2',
    senderId: 'currentUser',
    receiverId: 'user1',
    type: 'text',
    content: 'I\'m good! Just finished my project 🎉',
    timestamp: new Date(Date.now() - 85400000),
    reactions: ['🎉'],
    hasRead: true
  },
  {
    id: 'msg3',
    senderId: 'user2',
    receiverId: 'currentUser',
    type: 'audio',
    content: 'audio_message_1.mp3',
    duration: '0:30',
    timestamp: new Date(Date.now() - 3600000),
    reactions: ['👂'],
    hasRead: false
  },
  {
    id: 'msg4',
    senderId: 'user3',
    receiverId: 'currentUser',
    type: 'video',
    content: 'video_call_missed.mp4',
    duration: '0:00',
    timestamp: new Date(Date.now() - 7200000),
    callStatus: 'missed',
    hasRead: true
  },
  {
    id: 'msg5',
    senderId: 'currentUser',
    receiverId: 'user4',
    type: 'image',
    content: 'https://picsum.photos/200/300',
    timestamp: new Date(Date.now() - 1800000),
    reactions: ['😍', '❤️'],
    hasRead: true
  }
];

const sampleEmojis = ['😊', '😂', '❤️', '😍', '🎉', '👍', '🙌', '🤔', '😮', '😢'];

const sampleReactions = ['❤️', '👍', '😂', '😮', '😢', '🎉'];

const sampleHonorAIResponses = [
  {
    trigger: 'greeting',
    responses: [
      'Hello! How can I assist you today? 🤖',
      'Hi there! I\'m Honor AI, ready to help! 👋',
      'Greetings! What would you like to know? 💡'
    ]
  },
  {
    trigger: 'project_help',
    responses: [
      'I can help you manage your project tasks and deadlines. Would you like me to create a schedule? 📅',
      'Let\'s break down your project into manageable tasks. What\'s your main goal? 🎯',
      'I can suggest some project management tools and best practices. Interested? 💼'
    ]
  },
  {
    trigger: 'emotional_support',
    responses: [
      'I understand this might be challenging. Let\'s talk about it. 💭',
      'You\'re doing great! Remember to take breaks and practice self-care. 🌟',
      'I\'m here to listen and help you process your thoughts. What\'s on your mind? 🤗'
    ]
  },
  {
    trigger: 'technical_help',
    responses: [
      'I can guide you through common technical issues. What seems to be the problem? 🔧',
      'Let\'s troubleshoot this together. Can you describe what\'s happening? 💻',
      'I have access to various technical resources. What technology are you working with? 🛠️'
    ]
  }
];

module.exports = {
  sampleUsers,
  sampleMessages,
  sampleEmojis,
  sampleReactions,
  sampleHonorAIResponses
}; 