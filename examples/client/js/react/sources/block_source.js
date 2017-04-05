import * as driver from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../constants/application_constants';

import BlockActions from '../actions/block_actions';


const BlockSource = {
    lookupBlockList: {
        remote(state) {
            const {tx_id, status} = state.blockMeta;
            // fetch blocks for transaction
            return driver.Connection.listBlocks({tx_id, status}, API_PATH);
        },

        success: BlockActions.successFetchBlockList,
        error: BlockActions.errorBlock
    },

    lookupBlock: {
            remote(state) {
            const { block_id } = state.blockMeta;
            return driver.Connection.getBlock(block_id, API_PATH)
        },

        success: BlockActions.successFetchBlock,
        error: BlockActions.errorBlock
    },
};

export default BlockSource;
