const Service = require('../models/Service');
const { paginate } = require('../utils/helpers');

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
      Service.find(filter).populate('seller', 'name avatar rating college')
        .sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(lim),
      Service.countDocuments(filter)
    ]);

    res.json({ services, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('seller', 'name avatar rating college bio skills totalReviews');
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createService = async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, seller: req.user._id });
    res.status(201).json(service);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });
    if (service.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteService = async (req, res) => {
  try {
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
    const services = await Service.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getServices, getService, createService, updateService, deleteService, getMyServices };
