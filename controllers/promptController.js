const Prompt = require('../models/promptModel');

// @desc Get all prompts
// @route GET /api/prompts
// @access Private
const getPrompts = async (req, res) => {
    const prompts = await Prompt.find({ createdBy: req.user._id });
  res.json(prompts);
};

// @desc Create new prompt
// @route POST /api/prompts
// @access Private
const createPrompt = async (req, res) => {
  const { title, role, task, context, persona, category ,text,type} = req.body;
  if(!title || !role || !task || !text || !type) return res.status(400).json({ message: 'Title, role, and task required' });

  const prompt = await Prompt.create({ 
    title, role, task, context, persona, category, text,createdBy: req.user._id 
  });
  res.status(201).json(prompt);
};

// @desc Update prompt
// @route PUT /api/prompts/:id
// @access Private
const updatePrompt = async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if(!prompt) return res.status(404).json({ message: 'Prompt not found' });
  if(prompt.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

  const updatedPrompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedPrompt);
};

// @desc Delete prompt
// @route DELETE /api/prompts/:id
// @access Private
const deletePrompt = async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if(!prompt) return res.status(404).json({ message: 'Prompt not found' });
  if(prompt.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

  await prompt.deleteOne();
  res.json({ message: 'Prompt removed', id: req.params.id });
};

module.exports = { getPrompts, createPrompt, updatePrompt, deletePrompt };
