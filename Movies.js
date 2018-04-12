var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var ActorSchema = new Schema({
    ActorName: {type: String, required: true},
    CharacterName: {type: String, required: true}
});

var MovieSchema = new Schema({
    title: {type: String, required: true},
    year: {type: Number, required: true},
    Genre: {type:String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy','Horror', 'Mystery', 'Thriller']},
    Actor: {type: [ActorSchema]}

});

MovieSchema.pre('save', function(next) {
    if(this.Actor.length < 3){
        return new Error('Less than 3 actors');
    }
});

// return the model
module.exports = mongoose.model('Movies', MovieSchema);