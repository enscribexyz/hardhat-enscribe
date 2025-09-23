import "./internal/type-extensions";
import {PLUGIN_ID} from "./internal/constants.js"
import type { HardhatPlugin } from 'hardhat/types/plugins';
import {emptyTask, task} from "hardhat/config"
import { ArgumentType } from "hardhat/types/arguments";

const plugin: HardhatPlugin = {
    id: PLUGIN_ID,
    dependencies: () => [],
    tasks: [
        emptyTask("enscribe", "Set ENS primary names for smart contracts.").build(),
      task(["enscribe", "name"]).
      addPositionalArgument({
        name: "name",
        type: ArgumentType.STRING
      })
      .addOption({
        name: "contract",
        type: ArgumentType.STRING_WITHOUT_DEFAULT,
        description: "Contract address for which the primary name is to be set.",
        defaultValue: undefined
      })
      .addOption({
        name: "chain",
        type: ArgumentType.STRING_WITHOUT_DEFAULT,
        description: "Chain on which the address is to be named.",
        defaultValue: undefined
      })
      .setAction(() => import("./internal/tasks/name.js"))
      .build()
    ],
    hookHandlers: {},
    globalOptions: [],
  };
  
  export default plugin;
