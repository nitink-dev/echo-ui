
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; // Utilisation d'une version plus récente pour la sécurité et les optimisations.

contract TetherUSDT {
    string public name = "Tether USD";
    string public symbol = "USDT";
    uint8 public decimals = 6;
    uint256 public totalSupply = 50000000 * 10 ** uint256(decimals);

    // Mapping des soldes des adresses
    mapping(address => uint256) public balanceOf;

    // Mapping des autorisations d'un utilisateur pour dépenser les tokens d'un autre utilisateur
    mapping(address => mapping(address => uint256)) public allowance;

    // Événements pour émettre les changements
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        // Initialisation du totalSupply au créateur du contrat
        balanceOf[msg.sender] = totalSupply;
    }

    // Fonction de transfert de tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Solde insuffisant");

        // Effectuer le transfert
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Émettre l'événement de transfert
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Fonction d'approbation pour un utilisateur de dépenser des tokens au nom de l'appelant
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        // Émettre l'événement d'approbation
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Fonction de transfert de tokens d'un utilisateur à un autre via l'approbation
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Solde insuffisant");
        require(allowance[_from][msg.sender] >= _value, "Autorisation insuffisante");

        // Effectuer le transfert
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // Réduire l'autorisation restante pour le spender
        allowance[_from][msg.sender] -= _value;

        // Émettre l'événement de transfert
        emit Transfer(_from, _to, _value);
        return true;
    }
}