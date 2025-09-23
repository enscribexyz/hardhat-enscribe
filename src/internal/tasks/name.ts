import type { NewTaskActionFunction } from "hardhat/types/tasks";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

interface TaskNameArguments {
    name: string;
    contract?: string;
    chain?: string;
}
const taskName: NewTaskActionFunction<TaskNameArguments> = async(
    args, 
    hre: HardhatRuntimeEnvironment
) => {
    console.log(args);
};

export default taskName;