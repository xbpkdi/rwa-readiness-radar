// AUTO-GENERATED — do not edit by hand.
// Regenerate: cd contracts && npm run export-abi
// Source: contracts/artifacts/src/RWAReadinessRegistry.sol/RWAReadinessRegistry.json
// Generated: 2026-06-14T17:53:18.775Z

export const RWA_READINESS_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "reportHash",
        "type": "bytes32"
      }
    ],
    "name": "DuplicateReportHash",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyProjectId",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyReportHash",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "grade",
        "type": "uint8"
      }
    ],
    "name": "InvalidGrade",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "provided",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "expected",
        "type": "uint32"
      }
    ],
    "name": "InvalidVersion",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "score",
        "type": "uint16"
      }
    ],
    "name": "ScoreOutOfRange",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "SnapshotNotFound",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "reportHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "publisher",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "trustScore",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "supplyScore",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "distributionScore",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "utilityScore",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "overallReadinessScore",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "grade",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "publishedAt",
        "type": "uint64"
      }
    ],
    "name": "ReportPublished",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      }
    ],
    "name": "getLatestSnapshot",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "projectId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "reportHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint16",
            "name": "trustScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "supplyScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "distributionScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "utilityScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "overallReadinessScore",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "grade",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "version",
            "type": "uint32"
          },
          {
            "internalType": "address",
            "name": "publisher",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "publishedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct RWAReadinessRegistry.ReportSnapshot",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "getSnapshot",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "projectId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "reportHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint16",
            "name": "trustScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "supplyScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "distributionScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "utilityScore",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "overallReadinessScore",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "grade",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "version",
            "type": "uint32"
          },
          {
            "internalType": "address",
            "name": "publisher",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "publishedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct RWAReadinessRegistry.ReportSnapshot",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "reportHash",
        "type": "bytes32"
      }
    ],
    "name": "isReportHashUsed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      }
    ],
    "name": "latestVersion",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "projectId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "reportHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint16",
        "name": "trustScore",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "supplyScore",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "distributionScore",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "utilityScore",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "overallReadinessScore",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "grade",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "publishReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const
