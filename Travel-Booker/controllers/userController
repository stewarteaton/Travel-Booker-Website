const User = require('../models/user');
const Hotel = require('../models/hotels');
const Order = require('../models/orders');
const Passport = require('passport');

// Express Validator
const { check, validationResult} = require('express-validator/check');
const {sanitize} = require('express-validator/filter');

const querystring = require('querystring');

exports.signUpGet = (request, response) => {
    response.render('sign_up', { title: 'User Sign Up'});
}

exports.signUpPost = [
    // Validate User Data (Make sure data safe to pass to server)
    check('first_name').isLength({ min: 1 }).withMessage('First name must be specified')
    .isAlphanumeric().withMessage('First name must be alpha numeric'),

    check('surname').isLength({ min: 1 }).withMessage('Surname name must be specified')
    .isAlphanumeric().withMessage('Surname name must be alpha numeric'),

    check('email').isEmail().withMessage('Invalid email address'),

    check('confirm_email')
    .custom((value, {req}) => value===req.body.email)
    .withMessage('Email addresses do not match'),

    check('password').isLength({ min: 6 })
    .withMessage('Invalid passwords, passwords must be a minimum of 6 characters'),

    check('confirm_password')
    .custom((value, {req}) => value===req.body.password)
    .withMessage('Passwords do not match'),

    // .escape() removes any html errors for safety
    sanitize('*').trim().escape(),

    (request, response, next) => {
        const errors = validationResult(request);

        if(!errors.isEmpty()){
            // There are errors
            // response.json(request.body);
            response.render('sign_up', {title: 'Please fix the following errors:', errors: errors.array()});
            return;
        }
        else {
            // No Errors
            const newUser = new User(request.body);
            //user, password, callback function
            User.register(newUser,request.body.password, function(error){
                if(error){
                    console.log('error while registering', error);
                    return next(error);
                }
                next(); // move on to login post
            });
        }
    }
]

exports.loginGet = (request, response) => {
    response.render('login', {title: 'Log in to continue'});
}

exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/',
    successFlash: 'You are now logged in',
    failureRedirect: '/login',
    failureFlash: 'Log in failed, please try again'
})

exports.logout = (request, response) => {
    request.logout();
    request.flash('info', 'You are now logged out');
    response.redirect('/');
}

exports.bookingConfirmation = async (request, response, next) => {
    try{
        const data = request.params.data;
        const searchData = querystring.parse(data);
        const hotel = await Hotel.find({ _id: searchData.id})
        // response.json(searchData );
        response.render('confirmation', { title: 'Confirm your booking', hotel, searchData});
    } catch(error) {
        next(error)
    }
}

exports.orderPlaced = async (request, response, next) => {
    try{
        const data = request.params.data;
        const parsedData = querystring.parse(data);
        const order = new Order({
            user_id: request.user._id,
            hotel_id: parsedData.id,
            order_details: {
                duration: parsedData.duration,
                dateOfDeparture: parsedData.dateOfDeparture,
                numberOfGuests: parsedData.numberOfGuests
            }
        })        
        await order.save();
        request.flash('info', 'Thank you! Your order has been placed!');
        response.redirect('/my-account');
    } catch(error){
        next(error)
    }
}

exports.myAccount = async (request, response, next) => {
    try{
        // const orders = await Order.find({user_id: request.user._id });
        // response.json(orders);
        const orders = await Order.aggregate([
            { $match: { user_id: request.user.id }},
            { $lookup: {
                from:'hotels',
                localField: 'hotel_id',
                foreignField: '_id',
                as: 'hotel_data'
            }}
        ])
        response.render('user_account', {title: 'My Account', orders})
    } catch(error) {

    }
}

exports.allOrders = async (request, response, next) => {
    try{
        // const orders = await Order.find({user_id: request.user._id });
        // response.json(orders);
        const orders = await Order.aggregate([
            { $lookup: {
                from:'hotels',
                localField: 'hotel_id',
                foreignField: '_id',
                as: 'hotel_data'
            }}
        ])
        response.render('orders', {title: 'All Orders', orders})
    } catch(error) {

    }
}

exports.isAdmin = (request, response, next) => {
    // isAdmin function in user.js
    if (request.isAuthenticated() && request.user.isAdmin){
        next();
        return;
    }
    response.redirect('/');
}
