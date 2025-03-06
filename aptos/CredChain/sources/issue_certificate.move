module CredChain::issue_certificate {
    use std::error;
    use std::signer;
    use std::string;
    use std::vector;

    struct CertificateHolder has key {
        certificates: vector<Certificate>,
    }

    struct Certificate has store {
        certificate_id: string::String,
        certificate_data: string::String,
    }

    #[event]
    struct CertificateIssued has drop, store {
        account: address,
        certificate_data: string::String,
    }

    const ENO_CERTIFICATE: u64 = 0;

    #[view]
    public fun get_certificate(addr: address, cert_id: string::String): string::String acquires CertificateHolder {
        assert!(exists<CertificateHolder>(addr), error::not_found(ENO_CERTIFICATE));
        let holder = borrow_global<CertificateHolder>(addr);
        let i = 0;
        let len = vector::length(&holder.certificates);
        while (i < len) {
            let cert = vector::borrow(&holder.certificates, i);
            if (cert.certificate_id == cert_id) {
                return cert.certificate_data
            };
            i = i + 1;
        };
        abort error::not_found(ENO_CERTIFICATE)
    }

    public entry fun issue_certificate(account: signer, certificate_id: string::String, certificate_data: string::String) acquires CertificateHolder {
        let account_addr = signer::address_of(&account);
        if (!exists<CertificateHolder>(account_addr)) {
            let certificates = vector::empty<Certificate>();
            vector::push_back(&mut certificates, Certificate {
                certificate_id,
                certificate_data,
            });
            move_to(&account, CertificateHolder { certificates });
        } else {
            let holder = borrow_global_mut<CertificateHolder>(account_addr);
            vector::push_back(&mut holder.certificates, Certificate {
                certificate_id,
                certificate_data,
            });
        }
    }

    #[test(account = @0x1)]
    public entry fun test_issue_and_get_certificate(account: signer) acquires CertificateHolder {
        let addr = signer::address_of(&account);
        aptos_framework::account::create_account_for_test(addr);

        // Issue a certificate
        issue_certificate(account, string::utf8(b"cert1"), string::utf8(b"Certificate Data"));

        // Verify it
        assert!(
            get_certificate(addr, string::utf8(b"cert1")) == string::utf8(b"Certificate Data"),
            ENO_CERTIFICATE
        );
    }
}