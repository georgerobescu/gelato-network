pragma solidity ^0.6.2;

import "../gelato_core/interfaces/IGelatoCore.sol";

// For debugging purposes we do not revert if anything goes wrong
//  so that we can emit the LogFailure event. This is necessary because the
//  delegatecalling GnosisSafeProxy low-level catches reverts and overrides
//  their message. see ModuleManager.setupModules require expression:
// https://github.com/gnosis/safe-contracts/blob/aa0f3345b609a816ace6c448960ddb852b8a1bbd/contracts/base/ModuleManager.sol#L29

/// @title CreateAndMint
/// @notice Script to be run during Gnosis Safe Proxy setup for Gelato integration
/// @dev Should be delegatecalled from gnosisSafeProxy.setup.setupModules(to,data):
///       - <to> should be the address of this contract: GnosisSafeProxyGelatoCoreSetup
///       - <data> should be the encodedPayload for whitelistAndMint
contract GnosisSafeProxyGelatoCoreSetup {

    event LogFailure(string error);

    /// @dev This function should be delegatecalled
    function whitelistAndMint(
        address _gelatoCore,
        address _selectedExecutor,
        IGelatoCondition _condition,
        bytes calldata _conditionPayloadWithSelector,
        IGelatoAction _action,
        bytes calldata _actionPayloadWithSelector
    )
        external
    {
        // Whitelist GelatoCore as module on delegatecaller (Gnosis Safe Proxy)
        try IGnosisSafe(address(this)).enableModule(_gelatoCore) {
        } catch Error(string memory error) {
            emit LogFailure(error);
        } catch {
            emit LogFailure("enableModule error");
        }

        // Mint on GelatoCore from delegatecaller (Gnosis Safe Proxy)
        try IGelatoCore(_gelatoCore).mintExecutionClaim(
            _selectedExecutor,
            _condition,
            _conditionPayloadWithSelector,
            _action,
            _actionPayloadWithSelector
        )  {
        } catch Error(string memory error) {
            emit LogFailure(error);
        } catch {
            emit LogFailure("mintExecutionClaim error");
        }
    }
}