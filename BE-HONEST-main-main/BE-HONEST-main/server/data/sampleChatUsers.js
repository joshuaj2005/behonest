const sampleUsers = [
  {
    id: 'user1',
    name: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Photography', 'Travel'],
    bio: 'Adventure seeker | Photography enthusiast'
  },
  {
    id: 'user2',
    name: 'Alex Chen',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Gaming', 'Technology'],
    bio: 'Tech geek | Gamer'
  },
  {
    id: 'user3',
    name: 'Sophia Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Art', 'Music'],
    bio: 'Artist | Music lover'
  },
  {
    id: 'user4',
    name: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    interests: ['Sports', 'Fitness'],
    bio: 'Sports enthusiast | Fitness trainer'
  },
  {
    id: 'user5',
    name: 'Olivia Taylor',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Cooking', 'Travel'],
    bio: 'Food lover | World traveler'
  },
  {
    id: 'user6',
    name: 'Daniel Kim',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Movies', 'Books'],
    bio: 'Film buff | Bookworm'
  },
  {
    id: 'user7',
    name: 'Isabella Garcia',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
    interests: ['Fashion', 'Design'],
    bio: 'Fashion designer | Creative soul'
  },
  {
    id: 'user8',
    name: 'Lucas Brown',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Music', 'Dance'],
    bio: 'Musician | Dancer'
  },
  {
    id: 'user9',
    name: 'Ava Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/9.jpg',
    status: 'online',
    lastSeen: new Date(),
    interests: ['Yoga', 'Meditation'],
    bio: 'Yoga instructor | Mindfulness coach'
  },
  {
    id: 'user10',
    name: 'Ethan Lee',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 10800000), // 3 hours ago
    interests: ['Technology', 'Startups'],
    bio: 'Tech entrepreneur | Startup enthusiast'
  }
];

const sampleResponses = {
  'user1': {
    greeting: ["Hi there! 📸 Just got back from an amazing photo shoot!", "Hello! Want to see some of my latest travel photos?"],
    interests: ["Have you been to any interesting places lately?", "What's your favorite photography spot?"],
    default: ["That's fascinating! I'd love to capture that moment.", "Let me share a picture from my recent adventures!"]
  },
  'user2': {
    greeting: ["Hey! Just finished a gaming session 🎮", "What's up! Have you tried any new games lately?"],
    interests: ["Which games are you into?", "Did you see the latest tech news?"],
    default: ["That's awesome! Want to play something together?", "Let me know if you need any tech recommendations!"]
  },
  'user3': {
    greeting: ["Hello! 🎨 Working on a new piece right now!", "Hi! What kind of music are you listening to lately?"],
    interests: ["What's your favorite art style?", "Have you been to any good concerts recently?"],
    default: ["That's inspiring! I might turn that into art!", "Music really brings people together, doesn't it?"]
  },
  'user4': {
    greeting: ["Hey! Just finished my workout 💪", "Hi there! Ready for some fitness tips?"],
    interests: ["What's your workout routine?", "Have you tried any new sports lately?"],
    default: ["Keep pushing! You've got this!", "Let's plan a workout session together!"]
  },
  'user5': {
    greeting: ["Hi! 🌮 Just tried a new recipe!", "Hello! Planning my next travel adventure!"],
    interests: ["What's your favorite cuisine?", "Where's your dream destination?"],
    default: ["I should add that to my recipe book!", "That reminds me of my trip to..."]
  },
  'user6': {
    greeting: ["Hey! 📚 Just finished an amazing book!", "What's up! Watched any good movies lately?"],
    interests: ["What genre do you prefer?", "Have you read any good books recently?"],
    default: ["That's like that scene from...", "I can recommend some similar books/movies!"]
  },
  'user7': {
    greeting: ["Hi! 👗 Working on a new design!", "Hello! What's your style inspiration?"],
    interests: ["What's your favorite fashion era?", "Any favorite designers?"],
    default: ["That would make a great design inspiration!", "Fashion is all about expressing yourself!"]
  },
  'user8': {
    greeting: ["Hey! 🎵 Just finished band practice!", "Hi there! Ready to dance?"],
    interests: ["What music gets you moving?", "Do you play any instruments?"],
    default: ["That's got a great rhythm to it!", "We should jam together sometime!"]
  },
  'user9': {
    greeting: ["Namaste! 🧘‍♀️ Just finished a meditation session!", "Hi! How's your inner peace today?"],
    interests: ["Have you tried mindfulness?", "What helps you stay centered?"],
    default: ["Take a deep breath and center yourself.", "Let's focus on the positive energy!"]
  },
  'user10': {
    greeting: ["Hey! 💡 Working on a new startup idea!", "Hi there! What's your take on AI?"],
    interests: ["What's your favorite tech innovation?", "Any startup ideas you're working on?"],
    default: ["That could be a great market opportunity!", "Innovation is all about solving problems!"]
  }
};

const getRandomResponse = (userId, type = 'default') => {
  const userResponses = sampleResponses[userId];
  const responses = userResponses[type] || userResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
};

module.exports = {
  sampleUsers,
  getRandomResponse
}; 