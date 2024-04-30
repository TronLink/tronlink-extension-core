export const address = 'TWer2Ygk5TEheHp3TPuYeqxmB6SsGZmaL6';
export const mnemonic = 'test test test test test test test test test test test junk';
export const privateKey = '15f0bbb1774be40b7a8d7965d637f324bda2f711fc5726a3dcc19585c6950954';
export const nodeInfo = {
  fullNode: 'https://api.nileex.io',
  solidityNode: 'https://api.nileex.io',
  eventServer: 'https://event.nileex.io',
  headers: {},
};

export const signMessage = 'hello world';
export const hexMessage = 'fa26db7ca85ead399216e7c6316bc50ed24393c3122b582735e7f3b0f91b93f0';
export const transaction = {
  txID: 'c8d7e1cf5e1f27889515df9dc18169eed6a5f74e9543354b9128ce403634cf26',
  raw_data: {
    contract: [
      {
        parameter: {
          value: {
            amount: 1000000,
            owner_address: '41e2e1a54926527fbb4e4420de4c6bab82beaee24d',
            to_address: '419f2e05d49b5fe66dce55598984aace7b3dc45fb0',
          },
          type_url: 'type.googleapis.com/protocol.TransferContract',
        },
        type: 'TransferContract',
      },
    ],
    ref_block_bytes: 'dde0',
    ref_block_hash: '66fea74cf209c48a',
    expiration: 1706089173000,
    timestamp: 1706089113000,
  },
  raw_data_hex:
    '0a02dde0220866fea74cf209c48a4088a0dbd6d3315a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a1541e2e1a54926527fbb4e4420de4c6bab82beaee24d1215419f2e05d49b5fe66dce55598984aace7b3dc45fb018c0843d70a8cbd7d6d331',
  visible: false,
};

export const transferAssetContractTransaction = {
  txID: '5ec8e3264fc58105221151a71a41c5cbc981be22fc4b17284167b930a3116b57',
  raw_data: {
    data: '74657374',
    contract: [
      {
        parameter: {
          value: {
            amount: 1000000,
            asset_name: '31303030363036',
            owner_address: '414feaf7689a60885703cd86a6b8354ab9457bc4cc',
            to_address: '419f2e05d49b5fe66dce55598984aace7b3dc45fb0',
          },
          type_url: 'type.googleapis.com/protocol.TransferAssetContract',
        },
        type: 'TransferAssetContract',
      },
    ],
    ref_block_bytes: '927f',
    ref_block_hash: '21bd2d21a085b788',
    expiration: 1707458682000,
    timestamp: 1707458622000,
  },
  raw_data_hex:
    '0a02927f220821bd2d21a085b7884090b9dfe3d8315204746573745a75080212710a32747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e736665724173736574436f6e7472616374123b0a07313030303630361215414feaf7689a60885703cd86a6b8354ab9457bc4cc1a15419f2e05d49b5fe66dce55598984aace7b3dc45fb020c0843d70b0e4dbe3d831',
  visible: false,
};

export const triggerSmartContractTransaction = {
  txID: '18c5ccb2f4ba3eecff1f3ebeb936dcccebd256b71ca54279655d079965005816',
  raw_data: {
    data: '74657374',
    contract: [
      {
        parameter: {
          value: {
            data: 'a9059cbb0000000000000000000000009f2e05d49b5fe66dce55598984aace7b3dc45fb00000000000000000000000000000000000000000000000000de0b6b3a7640000',
            owner_address: '4104c0fd0be93576ebd2a8f9776a81d0bfeefb9a07',
            contract_address: '4137349aeb75a32f8c4c090daff376cf975f5d2eba',
          },
          type_url: 'type.googleapis.com/protocol.TriggerSmartContract',
        },
        type: 'TriggerSmartContract',
      },
    ],
    ref_block_bytes: '905c',
    ref_block_hash: 'ec68615e600690cd',
    expiration: 1707457032000,
    fee_limit: 1000000000,
    timestamp: 1707456974460,
  },
  raw_data_hex:
    '0a02905c2208ec68615e600690cd40c0defae2d8315204746573745aae01081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a154104c0fd0be93576ebd2a8f9776a81d0bfeefb9a0712154137349aeb75a32f8c4c090daff376cf975f5d2eba2244a9059cbb0000000000000000000000009f2e05d49b5fe66dce55598984aace7b3dc45fb00000000000000000000000000000000000000000000000000de0b6b3a764000070fc9cf7e2d83190018094ebdc03',
  visible: false,
};
export const typedData = {
  domain: {
    name: 'TRON Mail',
    version: '1',
    chainId: '0x2b6653dc',
    verifyingContract: 'TUe6BwpA7sVTDKaJQoia7FWZpC9sK8WM2t',
  },

  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },

  message: {
    from: {
      name: 'Cow',
      wallet: 'TUg28KYvCXWW81EqMUeZvCZmZw2BChk1HQ',
    },
    to: {
      name: 'Bob',
      wallet: 'TT5rFsXYCrnzdE2q1WdR9F2SuVY59A4hoM',
    },
    contents: 'Hello, Bob!',
  },
};
