const home = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Delhi Tour API is running."
    });

};

module.exports = {
    home
};