package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.UserRegisterDto;
import com.syfe.personalfinance.entity.User;

public interface UserService {
    User registerUser(UserRegisterDto registerDto);
    User getUserByUsername(String username);
}
