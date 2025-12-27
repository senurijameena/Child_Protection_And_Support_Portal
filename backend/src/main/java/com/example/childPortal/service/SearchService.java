package com.example.childPortal.service; 

import com.example.childPortal.dto.*;
import org.springframework.data.domain.Pageable;

public interface SearchService {
  PaginationDTO<CaseDTO> searchCases(CaseSearchFilterDTO filter, Pageable pageable);
  PaginationDTO<HelpRequestDTO> searchHelpRequests(HelpRequestSearchFilterDTO filter, Pageable pageable);
  PaginationDTO<UserDTO> searchUsers(UserSearchFilterDTO filter, Pageable pageable);

}
