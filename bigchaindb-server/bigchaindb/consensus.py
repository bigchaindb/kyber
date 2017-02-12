import logging

from bigchaindb.utils import verify_vote_signature
from bigchaindb.common.schema import (SchemaValidationError,
                                      validate_vote_schema)
from bigchaindb.common.asset import validate_asset

logger = logging.getLogger(__name__)


class BaseConsensusRules():
    """Base consensus rules for Bigchain.
    """

    @staticmethod
    def validate_transaction(bigchain, transaction):
        """See :meth:`bigchaindb.models.Transaction.validate`
        for documentation.

        """
        valid_tx = transaction.validate(bigchain)
        if not valid_tx:
            return False
        valid_tx = validate_asset(transaction, bigchain)
        if not valid_tx:
            print("Invalid Asset")
            return False
        return True

    @staticmethod
    def validate_block(bigchain, block):
        """See :meth:`bigchaindb.models.Block.validate` for documentation."""
        return block.validate(bigchain)

    @staticmethod
    def verify_vote(voters, signed_vote):
        """Verify the signature of a vote.

        Refer to the documentation of
        :func:`bigchaindb.utils.verify_signature`.
        """
        if verify_vote_signature(voters, signed_vote):
            try:
                validate_vote_schema(signed_vote)
                return True
            except SchemaValidationError as exc:
                logger.warning(exc)
        else:
            logger.warning('Vote failed signature verification: '
                           '%s with voters: %s', signed_vote, voters)
        return False
