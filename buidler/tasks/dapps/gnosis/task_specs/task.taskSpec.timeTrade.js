import { task, types } from "@nomiclabs/buidler/config";
import { constants, utils } from "ethers";

export default internalTask(
  "gc-return-taskspec-timeTrade",
  `Returns a hardcoded task spec for the timeTrade Script`
)
  .addFlag("log")
  .setAction(async ({ log }) => {
    try {
      if (network.name != "rinkeby") throw new Error("\nwrong network!");

      // ##### Condition
      const conditionAddress = await run("bre-config", {
        deployments: true,
        contractname: "ConditionBatchExchangeFundsWithdrawable",
      });

      const condition = new Condition({
        inst: conditionAddress,
      });

      // ##### Action #1
      const placeOrderBatchExchangeAddress = await run("bre-config", {
        deployments: true,
        contractname: "ActionPlaceOrderBatchExchangeWithSlippage",
      });

      const placeOrderAction = new Action({
        addr: placeOrderBatchExchangeAddress,
        data: constants.HashZero,
        operation: Operation.Delegatecall,
        termsOkCheck: true,
      });

      // ##### Create Task Spec
      const taskSpec = new TaskSpec({
        conditions: [condition.inst],
        actions: [placeOrderAction],
        gasPriceCeil: 0, // Infinte gas price
      });

      if (log) console.log(taskSpec);

      return taskSpec;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
