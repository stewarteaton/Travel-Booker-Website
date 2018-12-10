//Require hotel model
const Hotel = require('../models/hotels');
const cloudinary = require('cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//if object left empty, images are stored to default directory
const storage = multer.diskStorage({});

const upload = multer({ storage });
//upload one image at a time
exports.upload = upload.single('image');

//if image is passes, cloudinary uploads image and then we create variable to request image from cloudinary
exports.pushToCloudinary = async (request,response, next) => { 
    if(request.file){
        cloudinary.uploader.upload(request.file.path)
        .then((result) => {
            request.body.image = result.public_id;
            //to move on hotelPost next piece of middleware
            next();
        })
        .catch(() => {
            request.flash('error', 'There was a problem uploading your image, please try again');
            response.redirect('admin/add');
        })
    } else {
        next();
    }
}

// exports.homePage = (req, response) => {
//     response.render('index', { title: "Let's Travel"});
// }

exports.listAllHotels = async (req, response, next) => {
    try{
        const allHotels = await Hotel.find({ available: {$eq:true}});
        response.render('all_hotels', {title: 'All Hotels', allHotels});
        //response.json(allHotels);
    } catch(error) {
        next (error);
    }
}

exports.listAllCountries = async (request, response, next) => {
    try{
        const allCountries = await Hotel.distinct('country');
        response.render('all_countries', {title: 'Browse by country', allCountries})
    } catch(error) {
        next(error)
    }
}

exports.homePageFilters = async (request, response, next) => {
    try{
        const hotels = Hotel.aggregate([
            //show 9=10 random countries
            { $match: { available: true }},
            { $sample: { size: 10}},

        ]);
        const countries = Hotel.aggregate([
            { $group: { _id : '$country'} },
            { $sample: { size:10 }}
        ]);

        const [filteredCountries, filteredHotels] = await Promise.all([countries, hotels]);
        //response.json(countries)
        response.render('index', {filteredCountries, filteredHotels});
    } catch(error) {
        next(error)
    }
}
exports.adminPage = (req, response) => {
    response.render('admin', {title: 'Admin' });
}
 


exports.createHotelGet = (req, res) => {
    res.render('add_hotel', {title: 'Add a new hotel'});
}

// Use asyn when handling data from database, needed for wait and next
exports.createHotelPost = async (req, res, next) => {
    try{
        const hotel = new Hotel(req.body);
         //make sure hotel saved before request data
         await hotel.save();
         req.flash('success', `${hotel.hotel_name} created successfully`)
         //must use back tick ` ` for dynamic data
         res.redirect(`/all/${hotel._id}`);
    } catch(error) {
        next (error)
    }
}

exports.editRemoveGet = (request, response) => {
    response.render('edit_remove', {title: 'Search for a hotel to edit or remove'});
}

exports.editRemovePost = async (request, response, next) => {
    try {
        const hotelId = request.body.hotel_id || null;
        const hotelName = request.body.hotel_name || null;

        const hotelData = await Hotel.find({ $or: [
            { _id: hotelId },
            { hotel_name: hotelName }
        ]}).collation({
            //language english, strength case 2 means not case sensitive
            locale: 'en',
            strength: 2
        });

        if(hotelData.length > 0) {
            response.render('hotel_detail', {title: 'Add/ Remove Hotel', hotelData})
            return
        }
        else {
            request.flash('info', 'No matches were found...');
            response.redirect('/admin/edit-remove');
        }
    } catch(error) {
        next(error)
    }
}

exports.updateHotelGet = async (request, response, next) => {
    try {
        const hotel = await Hotel.findOne({ _id: request.params.hotelId})
        response.render('add_hotel', {title:'Update hotel', hotel })
    } catch(error) {
        next(error)
    }
}

exports.updateHotelPost = async (request, response, next) => {
    try{
        const hotelId = request.params.hotelId;
        //new:true makes sure we get back modified version
        const hotel = await Hotel.findByIdAndUpdate(hotelId, request.body, {new:true});
        request.flash('success', `${hotel.hotel_name} updated successfully`);
        response.redirect(`/all/${hotelId}`)
    } catch (error) {
        next(error)
    }
}

exports.deleteHotelGet = async (request, response, next) => {
    try{
        const hotelId = request.params.hotelId;
        const hotel = await Hotel.findOne( { _id: hotelId });
        response.render('add_hotel', {title: 'Delete Hotel', hotel});
    } catch(error) {
        next(error)
    }
}

exports.deleteHotelPost = async (request, response, next) => {
    try{
        const hotelId = request.params.hotelId;
        const hotel = await Hotel.findByIdAndRemove({ _id: hotelId });
        request.flash('info', `${hotel.hotelId} has been deleted`);
        response.redirect('/');
    } catch(error) {
        next(error)
    }
}

exports.hotelDetail = async (request, response, next) => {
    try{
        const hotelParam = request.params.hotel;
        const hotelData = await Hotel.find( {_id: hotelParam});
        response.render('hotel_detail', {title: "Travel Booker", hotelData })
    } catch(error) {
        next(error)
    }
}

exports.hotelsByCountry = async (request, response, next) => {
    try{
        const countryParam = request.params.country
        const countryList = await Hotel.find({ country: countryParam });
        response.render('hotels_by_country', {title: ` Browse by country: ${countryParam}`, countryList });
    } catch (error) {
        next(error)
    }
}

exports.searchResults = async (request, response, next) => {
    try {
        const searchQuery = request.body;
        const parsedStars = parseInt(searchQuery.stars) || 1;
        const parsedSort = parseInt(searchQuery.sort) || 1;
        const searchData = await Hotel.aggregate([
            // $text performs a text search $search is mongodb query for a string
            { $match: { $text: {$search: `\"${searchQuery.destination}\"`} } },
            // gte = is greater than 
            { $match: { available: true, star_rating: { $gte: parsedStars}}},
            { $sort: { cost_per_night: parsedSort}}
        ]);
        // response.send(typeof searchQuery.stars);
        response.render('search_results', { title: 'Search results', searchQuery, searchData });

    } catch(error) {
        next(error)
    }
}
