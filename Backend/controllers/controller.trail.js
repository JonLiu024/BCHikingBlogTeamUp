

const createTrail = async(req, res) => {
    try {
        const trail = await Trail.create(req.body);
        res.status(200).json(trail);
    } catch (error) {
        if (error.code == 11000) {
            return res.status(409).send({message: "The trail with the same name has been created! Please add something new."});
        }
        res.status(500).send({message: error.message})
    }
}

const getAllTrails = async (req, res)=> {
    try {
        const trails = await Trail.find();
        res.status(200).json(trails);
    } catch (error) {
        res.status(500).send({message: error.Message});
    }
    
};

const updateTrail = async(req, res) => {
    try {
        const {id} = req.params;
        const trail = await Trail.findByIdAndUpdate(id, req.body);
        if (!trail) {
            return res.status(404).json({message: "The trail is not found!"});
        }

        const updatedTrail = await Trail.findById(id);
        res.status(200).json(updatedTrail);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


//get a trail by its id
const getTrail = async (req, res) => {
    try {
        const {id} = req.params;
        const trail = await Trail.findById(id);
        if (!trail) {
            return res.status(404).send({message: "The trail cannot be found!"});
        }
        res.status(200).json(trail);


    } catch (error) {
        res.status(500).send({message: error.message});
    }
};

const deleteTrail = async(req,res)=> {
    try {
        const {id} = req.params;
        const trail = Trail.findByIdAndDelete(id);
        
        if (!trail) {
            return res.status(404).json({message: "the blog cannot be found."});
        }
        res.status(200).json({message: "blog successfully deleted"});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
};

module.exports = {getAllTrails, getTrail, createTrail, updateTrail, deleteTrail}