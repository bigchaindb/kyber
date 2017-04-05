import alt from '../alt';

import BlockActions from '../actions/block_actions';
import BlockSource from '../sources/block_source';

class BlockStore {
    constructor() {
        this.block = null;
        this.blockMap = {};
        this.blockMeta = {
            block_id: null,
            err: null,
            tx_id: null,
            status: null,
        };
        this.bindActions(BlockActions);
        this.registerAsync(BlockSource);
    }

    onFetchBlockList({ txId, status }) {
        this.blockMeta.tx_id = txId;
        this.blockMeta.status = status;
        this.getInstance().lookupBlockList();
    }

    onSuccessFetchBlockList(blockList) {
        if (blockList) {
            const { tx_id } = this.blockMeta;
            this.blockMap[tx_id] = blockList;
            this.blockMeta.err = null;
            this.blockMeta.tx_id = null;
            this.blockMeta.status = null;
            return new Promise((resolve, reject) => resolve(this))
        } else {
            this.blockMeta.err = new Error('Problem fetching the block list');
        }
    }

    onFlushBlockList() {
        this.blockMap = {};
        this.blockMeta.tx_id = null;
        this.blockMeta.status = null;
    }

    onFetchBlock(block_id) {
        this.blockMeta.block_id = block_id;
        this.getInstance().lookupBlock();
    }

    onSuccessFetchBlock(block) {
        if (block) {
            this.block = block;
            this.blockMeta.err = null;
            this.blockMeta.block = null;
        } else {
            this.blockMeta.err = new Error('Problem fetching the block');
        }
    }

    onFlushBlock() {
        this.block = null;
        this.blockMeta.err = null;
        this.blockMeta.block = null;
    }

    onErrorBlock(err) {
        this.blockMeta.err = err;
    }
}

export default alt.createStore(BlockStore, 'BlockStore');
