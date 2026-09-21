
package com.unveiledlens.user;

import com.unveiledlens.common.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private String username;
    private String email;
    private String domain;
    private Role role;
    private String accountStatus;
}

