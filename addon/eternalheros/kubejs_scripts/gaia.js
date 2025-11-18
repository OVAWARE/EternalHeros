StartupEvents.registry('palladium:condition_serializer', (event) => {
	event.create('eternalheros:gaia')

	// Condition: true if the entity is standing on one of the listed blocks
	.test((entity) => {
		// Get block directly below the entity
		let blockBelow = entity.level.getBlock(entity.blockX, entity.blockY - 1, entity.blockZ);

		// List of allowed blocks (default: grass_block, dirt)
		let allowedBlocks = [
			'minecraft:grass_block',
			'minecraft:dirt'
		];

		return allowedBlocks.includes(blockBelow.id);
	});
});
