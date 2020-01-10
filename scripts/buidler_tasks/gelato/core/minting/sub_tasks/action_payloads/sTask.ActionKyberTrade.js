import { internalTask } from "@nomiclabs/buidler/config";
import { Contract, utils } from "ethers";

export default internalTask(
  "gelato-core-mint:payloads:ActionKyberTrade",
  `Returns a hardcoded actionPayloadWithSelector of ActionKyberTrade`
)
  .addFlag("log")
  .setAction(async ({ log }) => {
    try {
      const contractname = "ActionKyberTrade";
      // fired(address _coin, address _account, uint256 _refBalance)
      const functionname = "action";
      // Params
      const { luis: user } = await run("bre-config", {
        addressbookcategory: "EOA"
      });
      const { luis: userProxy } = await run("bre-config", {
        addressbookcategory: "userProxy"
      });
      const { DAI: src, KNC: dest } = await run("bre-config", {
        addressbookcategory: "erc20"
      });
      const srcAmt = utils.parseUnits("10", 18);

      // Read Instance of KyberContract
      const { proxy: kyberProxyAddress } = await run("bre-config", {
        addressbookcategory: "kyber"
      });
      const kyberABI = await run("getContractABI", { contractname: "IKyber" });
      const provider = ethers.provider;
      const kyberContract = new Contract(kyberProxyAddress, kyberABI, provider);
      // Fetch the slippage rate from KyberNetwork and assign it to minConversionRate
      const [_, minConversionRate] = await kyberContract.getExpectedRate(
        src,
        dest,
        srcAmt
      );

      // Params as sorted array of inputs for abi.encoding
      // action(_user, _userProxy, _src, _srcAmt, _dest, _minConversionRate)
      const inputs = [user, userProxy, src, srcAmt, dest, minConversionRate];
      // Encoding
      const payloadWithSelector = await run("abiEncodeWithSelector", {
        contractname,
        functionname,
        inputs,
        log
      });
      return payloadWithSelector;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
