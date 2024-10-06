var soundVector = 1;
var soundRepeat = 1;
var soundYaw = -180;
var soundDistance = 5;
var soundType = 81;
var soundLevel = 0;
var soundPlayerEnabled = false;
var surroundAllEntities = false;
var surroundAllPlayers = true;
var surroundExcludeSelf = false;
var playPositionList = [];

var showFunctionTip = true;
var currentUI = JSON.parse(readFile(getResource() + "/ui/ui_definition.json"));

if (soundPlayerEnabled || soundData.length > 0) {
  let targetIDs = surroundAllPlayers ? playerList.map(player => player.id) : targetList;
  if (surroundAllEntities) {
    targetIDs = targetIDs.concat(getEntityList());
  }
  if (playPositionList.length > 0) {
    targetIDs = playPositionList;
  }
  var soundProperties = {
    sound: soundType,
    level: soundLevel
  };
  var currentSounds = [soundProperties];
  soundYaw += 10;
  if (soundYaw > 180) {
    soundYaw = -180;
  }
  for (let i = 0; i < soundVector; i++) {
    if (soundData.length > 0) {
      currentSounds = soundData.shift().sounds;
    }
    if (currentSounds.length > 0) {
      for (let sound of currentSounds) {
        var soundId = sound.sound;
        var soundLevel = sound.level;
        targetIDs.map(targetID => {
          if (typeof targetID != "string") {
            for (let j = 0; j < soundRepeat; j++) {
              sendSound(Number(soundId), targetID.x, targetID.y, targetID.z, Number(soundLevel));
            }
          } else if (targetID != selfID || !surroundExcludeSelf) {
            const targetPosition = getEntityPos(targetID);
            var soundPosition = {
              yaw: soundYaw,
              pitch: 0
            };
            var newPosition = getDisplacement(soundDistance, targetPosition, soundPosition);
            for (let k = 0; k < soundRepeat; k++) {
              sendSound(Number(soundId), newPosition.x, newPosition.y, newPosition.z, Number(soundLevel));
            }
          }
        });
      }
    }
  }
  if (soundData.length > 0) {
    showTipMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §7>>>\n§r§l§b剩余音频数据 §r§7>>> §f" + soundData.length + "§l§b条");
  }
}

if (surroundLoop && soundPlayerEnabled && soundFile != null && soundData.length == 0) {
  soundData = JSON.parse(soundFile);
  if (showFunctionTip) {
    clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §u循环播放中 §b共§f" + soundData.length + "§b条音频数据");
  }
}

if (actionKey === "soundAdd") {
  soundType = Number(soundType) + 1;
}

if (typeof targetEntity !== "string") {
  for (let i = 0; i < soundRepeat; i++) {
    sendSound(Number(soundId), targetEntity.x, targetEntity.y, targetEntity.z, Number(soundLevel));
  }
} else if (targetEntity !== selfID || !surroundExcludeSelf) {
  const entityPosition = getEntityPos(targetEntity);
  var soundPosition = {
    yaw: soundYaw,
    pitch: 0
  };
  var newPosition = getDisplacement(soundDistance, entityPosition, soundPosition);
  for (let j = 0; j < soundRepeat; j++) {
    sendSound(Number(soundId), newPosition.x, newPosition.y, newPosition.z, Number(soundLevel));
  }
}

if (actionKey === "delete_PlayPos") {
  playPositionList = [];
}

if (actionKey === "addPlayPos") {
  const { x, y, z } = getPlayerBlockPos(selfID);
  addForm("{\"type\":\"custom_form\",\"title\":\"添加坐标\",\"content\":[{\"type\":\"input\",\"text\":\"以英文逗号 , 分割坐标\",\"placeholder\":\"0,0,0\",\"default\":\"" + obj2str([x, y, z]) + "\"}]}", function (response) {
    const positionArray = response.split(",");
    var newPosition = {};
    newPosition.x = Number(positionArray[0]);
    newPosition.y = Number(positionArray[1]);
    newPosition.z = Number(positionArray[2]);
    playPositionList.push(newPosition);
    if (showFunctionTip) {
      clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §a添加坐标成功 §d当前§f" + playPositionList.length + "§d组坐标");
    }
  });
}

if (actionKey === "loadSound") {
  const loadSoundForm = "{\"type\":\"custom_form\",\"title\":\"输入路径\",\"content\":[{\"type\":\"input\",\"text\":\"路径:\",\"default\":\"\"}]}";
  addForm(loadSoundForm, function (response) {
    const fileContent = read_file(response);
    if (fileContent != "" && soundPlayerEnabled) {
      soundData = JSON.parse(fileContent);
      soundFile = surroundLoop ? fileContent : [];
      if (showFunctionTip) {
        clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §a加载成功 §b共§f" + soundData.length + "§b条音频数据");
      }
    } else if (showFunctionTip) {
      clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §c加载失败 §f- §b文件为空或不存在或未启用功能");
    }
  });
}

if (actionKey === "selectSound") {
  const selectSoundForm = {
    type: "form",
    title: "音乐文件",
    content: "选择要加载的音乐",
    buttons: [{
      text: "没有文件"
    }]
  };
  const fileList = file_list(getResource() + "/sounds/AsakaMod");
  fileList.sort((a, b) => a.name.localeCompare(b.name));
  for (let i = 0; i < fileList.length; i++) {
    selectSoundForm.buttons[i] = {
      text: fileList[i].name,
      image: {
        type: "path",
        data: "textures/ui/sound_glyph_color_2x.png"
      }
    };
  }
  const formString = JSON.stringify(selectSoundForm);
  addForm(formString, function (response) {
    if (fileList.length > 0 && response >= 0) {
      const fileContent = read_file(fileList[response].path);
      if (fileContent != "" && soundPlayerEnabled) {
        soundData = JSON.parse(fileContent);
        soundFile = surroundLoop ? fileContent : [];
        if (showFunctionTip) {
          clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §a加载成功 §b共§f" + soundData.length + "§b条音频数据");
        }
      } else if (showFunctionTip) {
        clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §c加载失败 §f- §b文件为空或不存在或未启用功能");
      }
    }
  });
}


if (key === "surroundLoop" && !actionKey[key]) {
  soundFile = null;
}
if (key === "SoundPlayer" && !actionKey[key]) {
  soundData = [];
}
if (actionKey.key === "soundAdd") {
  soundType = Number(soundType) + 1;
}
if (actionKey.key === "soundLevel") {
  editValue(actionKey.key, soundLevel);
}
if (actionKey.key === "soundType") {
  editValue(actionKey.key, soundType);
}
if (playPositionList.length > 0) {
  targetIDs = playPositionList;
}
if (actionKey.key === "exit") {
  clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>> §cExit!");
}

clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>>§r 当前分支 §7>>>§r§a[公益] ");
clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>>§r §a36D音频播放 加载成功!");
clientMessage("§f[§uA§cs§ba§dk§ea§aM§9o§5d§f] §r§7>>>§r UI §7>>>§r 您当前使用的UI是: " + currentUI.name);
clientMessage('§r§lUI原作者: Lossiay QQ：1520349207\nEmail：1520349207@qq.com\n§r§l项目地址：https://github.com/LunarHaxCN/AsakaMod-36D-SoundEffect');
