StartupEvents.registry('palladium:condition_serializer', (event) => {
	event.create('eternalheros:sky_access')

	// Handler for the condition
	.test((entity) => {
		// Check if it's a player (safety guard)
		if (!entity.isPlayer()) return false;

		// Make sure the player is standing (not crouching or swimming)
		let standing = !entity.isCrouching() && !entity.isSwimming() && !entity.isFallFlying();

		// Check if entity is in overworld
		let inOverworld = entity.level.dimension === 'minecraft:overworld';

		// Check if it’s daytime
		let daytime = entity.level.isDay();

		// Check if the player has sky access (nothing blocking the sky)
		let skyAccess = entity.level.canSeeSky(entity.blockPosition());

		// Final condition
		return standing && inOverworld && daytime && skyAccess;
	});
});
