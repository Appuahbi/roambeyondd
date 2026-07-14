class ApiFeatures {

    constructor(query, queryString) {

        this.query = query;

        this.queryString = queryString;

    }

    filter() {

        const queryObj = { ...this.queryString };

        const excludedFields = [

            "page",

            "limit",

            "sort",

            "search"

        ];

        excludedFields.forEach(field => {

            delete queryObj[field];

        });

        this.query = this.query.find(queryObj);

        return this;

    }

    search(fields = []) {

        if (!this.queryString.search) {

            return this;

        }

        const keyword = this.queryString.search;

        const conditions = fields.map(field => ({

            [field]: {

                $regex: keyword,

                $options: "i"

            }

        }));

        this.query = this.query.find({

            $or: conditions

        });

        return this;

    }

    sort() {

        if (this.queryString.sort === "oldest") {

            this.query = this.query.sort("createdAt");

        } else {

            this.query = this.query.sort("-createdAt");

        }

        return this;

    }

    paginate() {

        const page = Number(this.queryString.page) || 1;

        const limit = Number(this.queryString.limit) || 10;

        const skip = (page - 1) * limit;

        this.query = this.query
            .skip(skip)
            .limit(limit);

        return this;

    }

}

module.exports = ApiFeatures;