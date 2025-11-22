import { IToken } from "@/api/tokens/types";
import { defChainIdArbitrum } from "@/hooks/useAuth";
import { Task } from "@/types";

export * from "./chains";
export * from "./iconNames";
export * from "./mediaQuery";
export * from "./routes";
export * from "./time";
export * from "./tokenIcons";

export const BIG_1E6 = 1000000;
export const BIG_1E8 = 100000000;
export const BIG_1E9 = 1000000000;
export const BIG_1E10 = 10000000000;
export const BIG_1E16 = 10000000000000000;
export const BIG_1E18 = 1000000000000000000;
export const BIG_1E20 = 100000000000000000000;

export const ARB_DEFAULT_EXPLORER_URL = "https://arbiscan.io";
export const ARB_CONFIRMATIONS_COUNT = 50;

export const BSC_DEFAULT_EXPLORER_URL = "https://bscscan.com";
export const BSC_CONFIRMATIONS_COUNT = 4;

export const BASE_DEFAULT_EXPLORER_URL = "https://basescan.org";
export const BASE_CONFIRMATIONS_COUNT = 3;

export const PARASWAP_SPENDER_ADDRESS = "0x216B4B4Ba9F3e719726886d34a177484278Bfcae";

export const USDT_TOKEN: IToken = {
  address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  symbol: "USDT",
  name: "Tether USD",
  decimals: 6,
  chainId: defChainIdArbitrum,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
};

export const ARB_TOKEN: IToken = {
  address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  symbol: "ARB",
  name: "Arbitrum",
  decimals: 18,
  chainId: defChainIdArbitrum,
  logoURI: "https://arbitrum.foundation/logo.png"
};

export const USDC_TOKEN: IToken = {
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  chainId: defChainIdArbitrum,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
};

export const WETH_TOKEN: IToken = {
  address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  symbol: "WETH",
  name: "Wrapped Ether",
  decimals: 18,
  chainId: defChainIdArbitrum,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
};

export const BALANCE_ERROR = "Insufficient funds";

export const DEPOSIT_SUCESS = "Deposit successful";

export const WITHDRAW_SUCESS = "Withdraw successful";

export const FIRELABS_AUDIT_LINK = "https://4irelabs.com/smart-contract-audit/";

export const HACKEN_AUDIT_LINK = "https://hacken.io/audits/rebalance/";

export const LOCAL_STORAGE_KEYS = {
  isShownTutorial: "isShownTutorial",
  isShownTasks: "isShownTasks",
  isSentDepositEvent: "isSentDepositEvent"
};

export const TWITTER_FOLLOW_URL = "https://x.com/intent/user?screen_name=rebalancefin";

export const TELEGRAM_FOLLOW_LINK = "https://t.me/+sQu_wAoL_FtlNjgy";

export const MOCKED_TASKS: Array<Task> = [
  {
    name: "Connect wallet",
    type: "wallet",
    complete: false
  },
  {
    name: "Follow us on Twitter",
    type: "twitter",
    complete: false
  },
  {
    name: "Join us on Telegram",
    type: "telegram",
    complete: false
  },
  {
    name: "Make a deposit",
    type: "deposit",
    complete: false
  },
  {
    name: "Freeze deposit to farm points",
    type: "freeze",
    complete: false
  }
];

export const NEW_MOCKED_TASKS: Array<Task> = [
  {
    name: "Connect wallet",
    type: "wallet",
    complete: false
  },
  // {
  //   name: "Deposit & freeze any FRAX amount",
  //   type: "frax",
  //   complete: false,
  //   limited: true
  // },
  {
    name: "Follow us on Twitter",
    type: "twitter",
    complete: false
  },
  {
    name: "Join us on Telegram",
    type: "telegram",
    complete: false
  }
];

export const MOCKED_ADDRESS = "0xA61327155f2b17A23648B208B4E5F141fBA77F7A";

export const DEPOSIT_STEPS_BASIC = ["Approve", "Deposit"];

export const DEPOSIT_STEPS_WITH_FREEZE = ["Approve", "Deposit", "Approve", "Freeze"];

export const ARB_TOKEN_ADDRESS = "0x912CE59144191C1204E64559FE8253a0e49E6548";

export const FRAX_TOKEN_ADDRESS = "0x7468a5d8E02245B00E8C0217fCE021C70Bc51305";

export const LOCK_TOKENS_CONTRACT_ADDRESS = "0x4c2db56998fEEb681bf82524b0cF8Dc4D99D2132";

export const INSUFFICIENT_BALANCE_ERROR = "You balance is insufficient";

export const RAINBOW_THEME = {
  colors: {
    accentColor: "hsl(0 0% 47%)",
    accentColorForeground: "hsl(0, 0%, 100%)",
    actionButtonBorder: "hsl(0, 0%, 0%)",
    actionButtonBorderMobile: "hsl(0, 0%, 0%)",
    actionButtonSecondaryBackground: "hsl(0, 0%, 100%)",
    closeButton: "hsl(0, 0%, 73%)",
    closeButtonBackground: "hsl(0, 0%, 8%)",
    connectButtonBackground: "hsl(0, 0%, 0%)",
    connectButtonBackgroundError: "hsl(360,100%,64%)",
    connectButtonInnerBackground: "hsl(0, 0%, 9%)",
    connectButtonText: "hsl(0, 0%, 100%)",
    connectButtonTextError: "hsl(0,0%,100%)",
    error: "hsl(0,0%,100%)",
    generalBorder: "hsl(0, 0%, 8%)",
    generalBorderDim: "rgba(0, 0, 0, 0.03)",
    menuItemBackground: "hsl(227, 0%, 8%)",
    modalBackdrop: "rgba(0, 0, 0, 0.5)",
    modalBackground: "hsl(0, 0%, 0%)",
    modalBorder: "hsl(0, 0%, 8%)",
    modalText: "hsl(0, 0%, 100%)",
    modalTextDim: "rgba(60, 66, 66, 0.3)",
    modalTextSecondary: "hsl(0, 0%, 60%)",
    profileAction: "hsl(0, 0%, 15%)",
    profileActionHover: "hsl(0, 0%, 25%)",
    profileForeground: "hsl(0, 0%, 6%)",
    selectedOptionBorder: "hsl(0 0% 47%)",
    downloadBottomCardBackground:
      '"linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #FFFFFF"',
    downloadTopCardBackground:
      '"linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #FFFFFF"',
    connectionIndicator: "hsl(107, 100%, 44%)",
    standby: "hsl(47, 100%, 63%)"
  },
  radii: {
    actionButton: "0px",
    connectButton: "0px",
    menuButton: "0px",
    modal: "0px",
    modalMobile: "0px"
  },
  shadows: {
    connectButton: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    dialog: "0px 8px 32px rgba(0, 0, 0, 0.32)",
    profileDetailsAction: "0px 2px 6px rgba(37, 41, 46, 0.04)",
    selectedOption: "0px 2px 6px rgba(0, 0, 0, 0.24)",
    selectedWallet: "0px 2px 6px rgba(0, 0, 0, 0.12)",
    walletLogo: "0px 2px 16px rgba(0, 0, 0, 0.16)"
  },
  blurs: {
    modalOverlay: "blur(0px)" // e.g. 'blur(4px)'
  },
  fonts: {
    body: "..." // default
  }
};

export const LINK_TERMS_OF_SERVICE =
  "https://docs.google.com/document/d/1c4CE-5Gj3JkQWwGPOIvJBXWndKk1kB51b8SeLQXNN0o";

export const LINK_PRIVACY_NOTICE =
  "https://docs.google.com/document/d/1PF4ik8sHbVqW8Lb8l6yo2H2vuQEZnr__-Ga2CMYW2yw";

// Demo mode deposit amounts per token
export const DEMO_DEPOSITS: Record<string, number> = {
  'DAI': 1000000,      // $1,000,000
  'USDC.e': 1600000,   // $1,600,000
  'USDC': 1200000,     // $1,200,000
  'USDT': 1200000      // $1,200,000
};
