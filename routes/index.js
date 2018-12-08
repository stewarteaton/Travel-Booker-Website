var express = require('express');
var router = express.Router();
//must require controllers
const hotelController = require('../controllers/hotelController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', hotelController.homePageFilters);

// This is a way to test if sessions is working properly
// router.get('/', function(request,response){
//     // can see how many times pag has been visited
//     if(request.session.page_views){
//         request.session.page_views++;
//         response.send(`Number of page visits: ${request.session.page_views}`)
//     } else {
//         request.session.page_views =1;
//         response.send('First visit');
//     }
// })

router.get('/all', hotelController.listAllHotels);
router.get('/all/:hotel', hotelController.hotelDetail);
router.get('/countries', hotelController.listAllCountries);
router.get('/countries/:country', hotelController.hotelsByCountry);
router.post('/results', hotelController.searchResults);

// ADMIN ROUTES
router.get('/admin', userController.isAdmin, hotelController.adminPage);
     // routes that start with admin
router.get('/admin/*', userController.isAdmin);
router.get('/admin/add', hotelController.createHotelGet);
router.post('/admin/add', hotelController.upload,
                          hotelController.pushToCloudinary,
                          hotelController.createHotelPost);
router.get('/admin/edit-remove', hotelController.editRemoveGet);
router.post('/admin/edit-remove', hotelController.editRemovePost);
router.get('/admin/:hotelId/update', hotelController.updateHotelGet);
router.post('/admin/:hotelId/update', 
                        hotelController.upload,
                        hotelController.pushToCloudinary,           
                        hotelController.updateHotelPost);
router.get('/admin/:hotelId/delete', hotelController.deleteHotelGet);
router.post('/admin/:hotelId/delete', hotelController.deleteHotelPost);
router.get('/admin/orders', userController.allOrders);

// USER ROUTES 
// ***************************
router.get('/sign-up', userController.signUpGet); 
router.post('/sign-up', userController.signUpPost, userController.loginPost);
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
router.get('/logout', userController.logout);
router.get('/confirmation/:data', userController.bookingConfirmation);
router.get('/order-placed/:data', userController.orderPlaced); 
router.get('/my-account', userController.myAccount);


module.exports = router;
