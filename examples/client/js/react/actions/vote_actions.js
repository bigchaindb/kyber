import alt from '../alt';


class VoteActions {
    constructor() {
        this.generateActions(
            'fetchVoteList',
            'successFetchVoteList',
            'flushVoteList'
        );
    }
}

export default alt.createActions(VoteActions);
