const User = require('../models/User');

exports.getFactories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('savedFactories');
    res.json(user.savedFactories || []);
  } catch (err) {
    next(err);
  }
};

exports.createFactory = async (req, res, next) => {
  try {
    const { name, location, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Factory name is required' });

    const user = await User.findById(req.user._id);
    user.savedFactories = user.savedFactories || [];
    const newFactory = { name, location, phone };
    user.savedFactories.push(newFactory);
    await user.save();

    const created = user.savedFactories[user.savedFactories.length - 1];
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('savedContacts');
    res.json(user.savedContacts || []);
  } catch (err) {
    next(err);
  }
};

exports.createContact = async (req, res, next) => {
  try {
    const { name, email, phone, countryCode, designation, position } = req.body;
    if (!name) return res.status(400).json({ message: 'Contact name is required' });

    const user = await User.findById(req.user._id);
    user.savedContacts = user.savedContacts || [];
    const newContact = {
      name,
      email,
      phone,
      countryCode: countryCode || req.body.country || undefined,
      position: position || designation || undefined,
    };
    user.savedContacts.push(newContact);
    await user.save();

    const created = user.savedContacts[user.savedContacts.length - 1];
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};
