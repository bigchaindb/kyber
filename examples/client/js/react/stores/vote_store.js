import { safeMerge } from 'js-utility-belt/es6';
import alt from '../alt';

import VoteActions from '../actions/vote_actions';
import VoteSource from '../sources/vote_source';

class VoteStore {
    constructor() {
        this.voteList = {};
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
            this.voteList = voteList;
            this.voteMeta.err = null;
            this.voteMeta.block_id = null;
        } else {
            this.voteMeta.err = new Error('Problem fetching the vote list');
        }
    }

    onFlushVoteList() {
        this.voteList = [];
        this.voteMeta.block_id = null;
    }

    onFetchVote(vote_id) {
        this.voteMeta.vote_id = vote_id;
        this.getInstance().lookupVote();
    }

    onErrorVote(err) {
        this.voteMeta.err = err;
    }
}

export default alt.createStore(VoteStore, 'VoteStore');
