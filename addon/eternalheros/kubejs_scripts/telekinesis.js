let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');
let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
let ClipContext = Java.loadClass('net.minecraft.world.level.ClipContext');
let BlockClip = Java.loadClass('net.minecraft.world.level.ClipContext$Block');
let FluidClip = Java.loadClass('net.minecraft.world.level.ClipContext$Fluid');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('eternalheros:telekinesis')
    .addProperty("distance", "integer", 4, "Hold distance in front of player")
    .addProperty("strength", "double", 0.2, "Force applied each tick")
    .addProperty("allowGroup", "boolean", false, "Allow picking up multiple entites")
    .addProperty("debug", "boolean", false, "Show debug info in chat")
    .addProperty("allowStruggling", "boolean", false, "Allows player targets to struggle")
    .icon(palladium.createItemIcon('eternalheros:icons/grab.png'))
    .tick((player, entry, holder, enabled) => {
      if (!enabled) return;
      try {
        let distance = entry.getPropertyByName('distance');
        let strength = entry.getPropertyByName('strength');
        let debug = entry.getPropertyByName('debug');
        let allowStruggling = entry.getPropertyByName('allowStruggling');
        
        if (!player || !player.level) return;
        let eyePos = player.getEyePosition(1.0);
        let lookVec = player.getLookAngle();
        let reach = 10;
        let endPos = eyePos.add(lookVec.scale(reach));
        
        // Raycast blocks
        let hitResult = player.level.clip(new ClipContext(
          eyePos,
          endPos,
          BlockClip.OUTLINE,
          FluidClip.NONE,
          player
        ));
        
        // Find nearest valid entity along look direction
        let entities = player.level.getEntities(player, player.getBoundingBox().expandTowards(lookVec.scale(reach)).inflate(1.0));
        let target = null;
        let nearestDist = Number.MAX_VALUE;
        
        for (let e of entities) {
          if (!e || !e.isAlive || e == player) continue;
          if (e.getTags && e.getTags().contains("broken_free")) continue;
          let ePos = (typeof e.position === "function") ? e.position() : null;
          if (!ePos) continue;
          let dist = eyePos.distanceTo(ePos);
          if (dist < nearestDist) {
            nearestDist = dist;
            target = e;
          }
        }
        
        if (!target) {
          if (debug && player.tell) player.tell("Telekinesis Active! No valid target.");
          return;
        }
        
        // Add struggle power to player targets TODO: actually fix this, NOT workin
        if (target.isPlayer && allowStruggling) {
          try {
            // Check if target already has the struggle power
            let targetHolder = target.getData('palladium:ability_holder');
            if (targetHolder && !targetHolder.hasAbility('eternalheros:struggle')) {
              targetHolder.addAbility('eternalheros:struggle');
              if (debug && player.tell) {
                player.tell(`Added struggle power to ${target.getName().getString()}`);
              }
            }
          } catch (err) {
            if (debug && player.tell) {
              player.tell(`Failed to add struggle power: ${err}`);
            }
          }
        }
        
        let targetPos = (typeof target.position === "function") ? target.position() : null;
        if (!targetPos) return;
        
        let holdPos = eyePos.add(lookVec.scale(distance));
        let motionVec = holdPos.subtract(targetPos).scale(strength);
        
        // Apply motion safely
        if (typeof target.setDeltaMovement === "function") {
          target.setDeltaMovement(motionVec);
        }
        
        // Send motion packet if the target is a player with a connection
        if (target.isPlayer && target.connection && typeof target.connection.send === "function") {
          target.connection.send(new ClientboundSetEntityMotionPacket(target));
          //let motion = new Vec3(motionVec.x, motionVec.y, motionVec.z);
          //target.connection.send(new ClientboundSetEntityMotionPacket(target.getId(), motion));

        }
        
        // Safe debug logging
        if (debug && player.tell) {
          try {
            player.tell("Telekinesis Active!");
            // Safe target name
            let name = (target && target.getName && typeof target.getName === "function") ? target.getName().getString() : "Unknown";
            player.tell(`Target: ${name}`);
            // Safe target position
            if (targetPos && typeof targetPos.x === "number" && typeof targetPos.y === "number" && typeof targetPos.z === "number") {
              player.tell(`Target Pos: X:${targetPos.x.toFixed(2)} Y:${targetPos.y.toFixed(2)} Z:${targetPos.z.toFixed(2)}`);
            } else {
              player.tell("Target Pos is null or invalid");
            }
            // Safe hold position
            if (holdPos && typeof holdPos.x === "number" && typeof holdPos.y === "number" && typeof holdPos.z === "number") {
              player.tell(`Hold Pos: X:${holdPos.x.toFixed(2)} Y:${holdPos.y.toFixed(2)} Z:${holdPos.z.toFixed(2)}`);
            } else {
              player.tell("Hold Pos is null or invalid");
            }
            // Safe motion vector
            if (motionVec && typeof motionVec.x === "number" && typeof motionVec.y === "number" && typeof motionVec.z === "number") {
              player.tell(`Motion Applied: X:${motionVec.x.toFixed(2)} Y:${motionVec.y.toFixed(2)} Z:${motionVec.z.toFixed(2)}`);
            } else {
              player.tell("Motion vector is null or invalid");
            }
            // Safe distance calculation
            if (eyePos && targetPos && typeof eyePos.distanceTo === "function") {
              player.tell(`Distance to Target: ${eyePos.distanceTo(targetPos).toFixed(2)}`);
            } else {
              player.tell("Cannot calculate distance to target");
            }
          } catch (err) {
            player.tell(`Debug error: ${err}`);
          }
        }
      } catch (err) {
        if (player.tell) player.tell("Telekinesis error (caught safely).");
        console.error("Telekinesis ability error:", err);
      }
    });
});