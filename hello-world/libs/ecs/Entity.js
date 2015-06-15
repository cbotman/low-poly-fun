
P.Ecs.Entity = function() {

	// Generate new ID
	P.Ecs.Entity._counter++;
	this._id = P.Ecs.Entity._counter;
	
	// Store components
	this._components = {};
};

P.Ecs.Entity._counter = 0;

P.Ecs.Entity.prototype.addComponent = function( key, component ) {

	this._components[key] = component;
	return this;
};

P.Ecs.Entity.prototype.removeComponent = function( key ) {

	delete this._components[key];
    return this;
};
