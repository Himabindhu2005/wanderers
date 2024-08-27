const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("db connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '66c73f7a417dd64ccd2be95d',
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: `https://picsum.photos/400?random=${Math.random()}`,
      description: "nushgusefaw difnj isufofwojfirwhrf fjwrwowgowjogiwig wt9w9wig0eige0kg",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude,
      cities[random1000].latitude]
      },
      images: [
        {
          // url: 'https://res.cloudinary.com/dserpq24p/image/upload/v1724565712/Wanderers/zna4qx0bpyrwgojz0b3g.jpg',
          // filename: 'Wanderers/zna4qx0bpyrwgojz0b3g',
          url: 'https://res.cloudinary.com/dserpq24p/image/upload/v1724565872/Wanderers/qwyzcyusdy46hq8gbghh.jpg',
          filename: 'Wanderers/qwyzcyusdy46hq8gbghh',
        },
        {
          url: 'https://res.cloudinary.com/dserpq24p/image/upload/v1724565872/Wanderers/qwyzcyusdy46hq8gbghh.jpg',
          filename: 'Wanderers/qwyzcyusdy46hq8gbghh',
        }
      ],
    })
    await camp.save();
  }
}

seedDb().then(() => {
  mongoose.connection.close();
})

