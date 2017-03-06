
export function getAssetIdFromTransaction(transaction){
    let asset_id;
    if (transaction && transaction.asset) {
        if (transaction.asset.id) {
            asset_id = transaction.asset.id;
        } else {
            asset_id = transaction.id;
        }
    }
    return asset_id;
}

export function resolveAssetFromTransaction(transaction){
    // if create, return asset
    // if transfer, fetch asset and return
}

export function transactionContains(transaction, value){

}

export function assetContains(asset, value){

}

export function metadataContains(metadata, value){

}

export function outputListContains(outputList, field, value){
    const result = outputList.map((output) => {
        if (outputContains(output, field, value)) {
            return true;
        }
    });
    return result.length > 0;
}

export function outputContains(output, field, value) {
    if (!output || !value || !field) return false;
    if (field == 'public_keys' && output.public_keys.indexOf(value) > -1) return true;
    if (field == 'amount' && output.amount === value) return true;
    return false;
}


export function inputListContains(inputList, value){

}

export function inputContains(input, value){

}