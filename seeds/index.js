const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "608e7c6d15075b377014ecf3",
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nobis consequuntur numquam aliquam possimus. Similique tenetur provident, recusandae omnis ducimus dolorum quod quasi nam eum aperiam quis quia aspernatur quibusdam libero.",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [-113.1331, 47.0202],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dhrizmn0m/image/upload/v1624679701/YelpCamp/h2eu5fhj4mlcbay1deo8.jpg",
          filename: "YelpCamp/h2eu5fhj4mlcbay1deo8",
        },
        {
          url: "https://res.cloudinary.com/dhrizmn0m/image/upload/v1624679707/YelpCamp/ppiyde0nij0uanbedtmi.jpg",
          filename: "YelpCamp/ppiyde0nij0uanbedtmi",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
