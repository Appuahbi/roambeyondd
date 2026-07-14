const pick = (object, allowedFields) => {

    const result = {};

    for (const field of allowedFields) {

        if (Object.prototype.hasOwnProperty.call(object, field)) {
            result[field] = object[field];
        }

    }

    return result;

};

module.exports = pick;