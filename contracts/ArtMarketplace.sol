// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title ArtMarketplace
/// @notice A custom art marketplace contract with ETH-based purchases and
///         on-chain seller profiles. Each listing stores a public watermarked
///         URI, a full-quality primary image URI, and optional additional
///         asset URIs (PSD, ASE, PNG, JPEG, etc.) — all gated to buyers.
contract ArtMarketplace {
    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    struct SellerProfile {
        string username;
        string avatarURI;
        bool isRegistered;
    }

    struct ArtListing {
        uint256 id;
        address seller;
        string title;
        string description;
        /// @dev Low-quality, watermarked image URI — always publicly visible.
        string imageURIWatermarked;
        uint256 priceWei;
        bool isActive;
        uint256 salesCount;
        /// @dev Number of additional buyer-gated assets (source files, etc.).
        uint256 assetCount;
    }

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    mapping(address => SellerProfile) public profiles;

    ArtListing[] private _listings;
    uint256 public listingCount;

    mapping(address => uint256[]) private _sellerListings;
    mapping(address => uint256[]) private _buyerPurchases;

    /// @dev Full-quality image URIs, gated to verified buyers only.
    mapping(uint256 => string) private _fullImageURIs;

    /// @dev O(1) purchase lookup used to gate _fullImageURIs access.
    mapping(uint256 => mapping(address => bool)) private _hasPurchased;

    /// @dev Additional buyer-gated asset URIs (source files, exports, etc.).
    mapping(uint256 => string[]) private _additionalAssets;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event ProfileRegistered(address indexed seller, string username);
    event ArtUploaded(
        uint256 indexed listingId,
        address indexed seller,
        uint256 priceWei
    );
    event ArtSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 priceWei
    );

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error NotRegistered();
    error InvalidPrice();
    error NotSeller();
    error ListingNotActive();
    error IncorrectPayment();
    error NotBuyer();
    error TransferFailed();
    error NoListings();
    error SelfPurchase();
    error AlreadyPurchased();
    error MissingImage();

    // -------------------------------------------------------------------------
    // Write functions
    // -------------------------------------------------------------------------

    /// @notice Create or update the caller's seller profile.
    function registerProfile(
        string calldata username,
        string calldata avatarURI
    ) external {
        profiles[msg.sender] = SellerProfile({
            username: username,
            avatarURI: avatarURI,
            isRegistered: true
        });
        emit ProfileRegistered(msg.sender, username);
    }

    /// @notice List a new artwork for sale.
    /// @param imageURIWatermarked  Low-quality watermarked URI shown to everyone.
    /// @param imageURIFull         Full-quality primary image, revealed to buyers.
    /// @param additionalAssetURIs  Optional extra buyer-gated files (PSD, ASE,
    ///                             PNG, JPEG, etc.). May be an empty array.
    /// @return listingId The ID of the newly created listing.
    function uploadArt(
        string calldata title,
        string calldata description,
        string calldata imageURIWatermarked,
        string calldata imageURIFull,
        string[] calldata additionalAssetURIs,
        uint256 priceWei
    ) external returns (uint256 listingId) {
        if (!profiles[msg.sender].isRegistered) revert NotRegistered();
        if (priceWei == 0) revert InvalidPrice();
        if (bytes(imageURIWatermarked).length == 0 || bytes(imageURIFull).length == 0)
            revert MissingImage();

        listingId = listingCount;

        _listings.push(
            ArtListing({
                id: listingId,
                seller: msg.sender,
                title: title,
                description: description,
                imageURIWatermarked: imageURIWatermarked,
                priceWei: priceWei,
                isActive: true,
                salesCount: 0,
                assetCount: additionalAssetURIs.length
            })
        );

        _fullImageURIs[listingId] = imageURIFull;

        for (uint256 i = 0; i < additionalAssetURIs.length; i++) {
            _additionalAssets[listingId].push(additionalAssetURIs[i]);
        }

        _sellerListings[msg.sender].push(listingId);
        listingCount++;

        emit ArtUploaded(listingId, msg.sender, priceWei);
    }

    /// @notice Permanently deactivate a listing. Only the seller may call this.
    function deactivateListing(uint256 listingId) external {
        ArtListing storage listing = _listings[listingId];
        if (listing.seller != msg.sender) revert NotSeller();
        listing.isActive = false;
    }

    /// @notice Purchase an artwork. Follows checks-effects-interactions.
    function buyArt(uint256 listingId) external payable {
        ArtListing storage listing = _listings[listingId];
        if (!listing.isActive) revert ListingNotActive();
        if (msg.value != listing.priceWei) revert IncorrectPayment();
        if (msg.sender == listing.seller) revert SelfPurchase();
        if (_hasPurchased[listingId][msg.sender]) revert AlreadyPurchased();

        // Effects
        listing.salesCount++;
        _buyerPurchases[msg.sender].push(listingId);
        _hasPurchased[listingId][msg.sender] = true;

        address seller = listing.seller;
        uint256 price = listing.priceWei;

        // Interactions
        (bool success, ) = seller.call{value: price}("");
        if (!success) revert TransferFailed();

        emit ArtSold(listingId, msg.sender, seller, price);
    }

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    /// @notice Returns the listing. `imageURIWatermarked` is always populated;
    ///         use `getFullImageURI` to obtain the full-quality image.
    function getListing(uint256 id) external view returns (ArtListing memory) {
        return _listings[id];
    }

    /// @notice Returns the full-quality image URI. Reverts if the caller has
    ///         not purchased this listing.
    function getFullImageURI(
        uint256 listingId
    ) external view returns (string memory) {
        if (!_hasPurchased[listingId][msg.sender]) revert NotBuyer();
        return _fullImageURIs[listingId];
    }

    /// @notice Returns the additional buyer-gated asset URIs (source files,
    ///         exports, etc.). Reverts if the caller has not purchased.
    function getAdditionalAssets(
        uint256 listingId
    ) external view returns (string[] memory) {
        if (!_hasPurchased[listingId][msg.sender]) revert NotBuyer();
        return _additionalAssets[listingId];
    }

    /// @notice Returns whether `buyer` has purchased `listingId`.
    function hasPurchased(
        uint256 listingId,
        address buyer
    ) external view returns (bool) {
        return _hasPurchased[listingId][buyer];
    }

    /// @notice Returns all listing IDs uploaded by `seller`.
    function getSellerListings(
        address seller
    ) external view returns (uint256[] memory) {
        return _sellerListings[seller];
    }

    /// @notice Returns all listing IDs purchased by `buyer`.
    function getBuyerPurchases(
        address buyer
    ) external view returns (uint256[] memory) {
        return _buyerPurchases[buyer];
    }

    /// @notice Returns the listing ID with the highest `salesCount` for
    ///         `seller`. Intended for the shop banner. Reverts if `seller`
    ///         has no listings.
    function getMostSoldArtId(
        address seller
    ) external view returns (uint256) {
        uint256[] storage ids = _sellerListings[seller];
        if (ids.length == 0) revert NoListings();

        uint256 bestId = ids[0];
        uint256 bestCount = _listings[ids[0]].salesCount;

        for (uint256 i = 1; i < ids.length; i++) {
            uint256 count = _listings[ids[i]].salesCount;
            if (count > bestCount) {
                bestCount = count;
                bestId = ids[i];
            }
        }

        return bestId;
    }
}
