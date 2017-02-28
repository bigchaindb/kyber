from cryptoconditions import (
    Condition,
    Ed25519Fulfillment,
    ThresholdSha256Fulfillment,
    fulfillment)


def _get_subcondition_indices(fulfillment, conditions_filter, public_key=None, type_id=None):
    indices = []
    conditions = []

    for i, c in enumerate(fulfillment.subconditions):
        if conditions_filter(c):
            indices.append(i)
            conditions.append(c['body'])
            break
        elif isinstance(c['body'], ThresholdSha256Fulfillment):
            result, index = _get_subcondition_indices(c['body'],
                                                      conditions_filter,
                                                      public_key=public_key,
                                                      type_id=type_id)
            if result:
                conditions += result
                indices += [i]
                indices += index
                break
    return conditions, indices


def get_subcondition(fulfillment, public_key=None, type_id=None):
    conditions_filter = None
    if public_key:
        if isinstance(public_key, str):
            public_key = public_key.encode()
        conditions_filter = lambda c: isinstance(c['body'], Ed25519Fulfillment) \
                                and c['body'].public_key.encode('base58') == public_key

    elif type_id is not None:
        conditions_filter = lambda c: c['body'].type_id == type_id

    _, indices = _get_subcondition_indices(fulfillment, conditions_filter, public_key, type_id)

    subfulfillment_source = fulfillment
    for index in indices:
        subfulfillment_source = subfulfillment_source.subconditions[index]['body']
    return subfulfillment_source if subfulfillment_source != fulfillment else None


def fulfill_subcondition(fulfillment, condition_uri, new_subfulfillment):
    import copy
    conditions_filter = lambda c: c['body'].serialize_uri() == condition_uri \
        if isinstance(c['body'], Condition) else c['body'].condition_uri == condition_uri
    _, indices = _get_subcondition_indices(fulfillment, conditions_filter)
    updated_fulfillment = copy.deepcopy(fulfillment)
    subfulfillment_source = updated_fulfillment
    if len(indices):
        for index in indices[:-1]:
            subfulfillment_source = subfulfillment_source.subconditions[index]['body']
        subfulfillment_source.subconditions[indices[-1]] = {
            'body': new_subfulfillment,
            'type': 'fulfillment',
            'weight': 1
        }
    return updated_fulfillment



