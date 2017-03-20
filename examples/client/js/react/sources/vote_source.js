import {
    listVotes
} from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../constants/application_constants';

import VoteActions from '../actions/vote_actions';


const VoteSource = {
    lookupVoteList: {
        remote(state) {
            const {block_id} = state.voteMeta;
            // fetch votes for block
            return listVotes(block_id, API_PATH);
        },

        success: VoteActions.successFetchVoteList,
        error: VoteActions.errorVoteList
    }
};

export default VoteSource;
