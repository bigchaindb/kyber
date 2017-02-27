module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    bs: {
      host: "hackathon-team6.ukwest.cloudapp.azure.com",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
