let BlockPos = Java.loadClass('net.minecraft.core.BlockPos');
let SoundEvents = Java.loadClass('net.minecraft.sounds.SoundEvents');
let SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource');
let Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('eternalheros:evaporation')
    .addProperty("range", "double", 5.0, "Evaporation radius") // 🌫️ sphere radius
    .addProperty("ignite", "boolean", false, "Ignite flammable blocks")
    .icon(palladium.createItemIcon('minecraft:water_bucket'))
    .tick((player, entry, holder, enabled) => {
      if (!enabled) return;

      try {
        let range = entry.getPropertyByName('range');
        let ignite = entry.getPropertyByName('ignite');

        if (!player || !player.level) return;
        let level = player.level;
        let center = player.blockPosition();

        // Loop over a cube, but filter to a sphere
        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            for (let dz = -range; dz <= range; dz++) {
              let distSq = dx*dx + dy*dy + dz*dz;
              if (distSq > range * range) continue; // keep it spherical

              let pos = center.offset(dx, dy, dz);
              let block = level.getBlockState(pos).getBlock();

              // 🌊 Clear only actual water source/flowing
              if (block == Blocks.WATER) {
                level.setBlock(pos, Blocks.AIR.defaultBlockState(), 3);
                level.playSound(null, pos, SoundEvents.FIRE_EXTINGUISH, SoundSource.BLOCKS, 0.5, 1.0);

                // 🔥 Optional ignition
                if (ignite) {
                  let above = pos.above();
                  if (level.isEmptyBlock(above) &&
                      Blocks.FIRE.defaultBlockState().canSurvive(level, above)) {
                    level.setBlock(above, Blocks.FIRE.defaultBlockState(), 3);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Evaporation ability error: " + err);
      }
    });
});
