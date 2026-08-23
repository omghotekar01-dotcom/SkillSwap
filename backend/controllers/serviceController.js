const Service = require('../models/Service');
const { paginate, isValidId } = require('../utils/helpers');

const getServices = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;
    const filter = { isActive: true };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 }
    };

    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const [services, total] = await Promise.all([
      Service.find(filter)
        .select('title category price rating totalReviews seller createdAt')
        .populate('seller', 'name avatar rating college')
        .sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(lim)
        .lean(),
      Service.countDocuments(filter)
    ]);

    res.json({ services, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getService = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid service id' });
    const service = await Service.findById(req.params.id)
      .populate('seller', 'name avatar rating college bio skills totalReviews');
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createService = async (req, res) => {
  try {
    const { title, description, category, price, deliveryDays, tags, images } = req.body;
    if (!title || !description || !category || price == null)
      return res.status(400).json({ message: 'Title, description, category, and price are required' });

    const service = await Service.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      price: Number(price),
      deliveryDays: Number(deliveryDays) || 3,
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : [],
      seller: req.user._id
    });
    res.status(201).json(service);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateService = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid service id' });
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });
    if (service.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    const allowed = ['title', 'description', 'category', 'price', 'deliveryDays', 'tags', 'images', 'isActive'];
    const updates = {};
    allowed.forEach(key => {
      if (key in req.body) updates[key] = req.body[key];
    });

    const updated = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteService = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid service id' });
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });
    if (service.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    await service.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ seller: req.user._id })
    .select('title category price isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getServices, getService, createService, updateService, deleteService, getMyServices };
