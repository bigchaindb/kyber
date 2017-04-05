import alt from '../alt';

import VoteActions from '../actions/vote_actions';
import VoteSource from '../sources/vote_source';

class VoteStore {
    constructor() {
        this.voteMap = {};
        this.voteMeta = {
            block_id: null,
            err: null,
        };
        this.bindActions(VoteActions);
        this.registerAsync(VoteSource);
    }

    onFetchVoteList(blockId) {
        this.voteMeta.block_id = blockId;
        this.getInstance().lookupVoteList();
    }

    onSuccessFetchVoteList(voteList) {
        if (voteList) {
            const { block_id } = this.voteMeta;
            this.voteMap[block_id] = voteList;
            this.voteMeta.err = null;
            this.voteMeta.block_id = null;
        } else {
            this.voteMeta.err = new Error('Problem fetching the vote list');
        }
    }

    onFlushVoteList() {
        this.voteMap = [];
        this.voteMeta.block_id = null;
    }


    onErrorVoteList(err) {
        this.voteMeta.err = err;
    }
}

export default alt.createStore(VoteStore, 'VoteStore');
