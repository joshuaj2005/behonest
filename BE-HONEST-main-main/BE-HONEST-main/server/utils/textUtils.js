// Functions for text processing

// Extract hashtags from text
const extractHashtags = (text) => {
  if (!text) return [];
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
};

// Extract mentions from text
const extractMentions = (text) => {
  if (!text) return [];
  const mentionRegex = /@[\w\u0590-\u05ff]+/g;
  return text.match(mentionRegex) || [];
};

module.exports = {
  extractHashtags,
  extractMentions
}; 