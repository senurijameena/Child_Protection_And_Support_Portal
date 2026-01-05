package com.example.childPortal.service.impl;

  import com.example.childPortal.dto.*;
  import com.example.childPortal.model.*;
  import com.example.childPortal.repository.*;
  import com.example.childPortal.service.SearchService;

  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.data.domain.Page;
  import org.springframework.data.domain.Pageable;
  import org.springframework.data.mongodb.core.MongoTemplate;
  import org.springframework.data.mongodb.core.query.Criteria;
  import org.springframework.data.mongodb.core.query.Query;
  import org.springframework.data.support.PageableExecutionUtils;
  import org.springframework.security.core.context.SecurityContextHolder; 
  import org.springframework.stereotype.Service;

  import java.time.LocalDateTime;
  import java.util.ArrayList;
  import java.util.List;

@Service
  public class SearchServiceImpl implements SearchService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    @Autowired
    private UserRepository userRepository;
    @Override
    public PaginationDTO<CaseDTO> searchCases(CaseSearchFilterDTO filter, Pageable pageable) {
      Query query = new Query();
      List<Criteria> criteriaList = new ArrayList<>();
      
      if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) { 
        criteriaList.add(new Criteria().orOperator(
        Criteria.where("trackingId").regex(filter.getKeyword(), "i"),
        Criteria.where("location").regex(filter.getKeyword(), "i"),
        Criteria.where("caseDescription").regex(filter.getKeyword(), "i"), 
        Criteria.where("reporterName").regex(filter.getKeyword(), "i")));
      }

      if (filter.getCaseType() != null) { 
        criteriaList.add(Criteria.where("caseType").is(filter.getCaseType()));
      }

      if (filter.getStatus() != null) { 
        criteriaList.add(Criteria.where("status").is(filter.getStatus()));
      }

      if (filter.getPriority() != null) { 
        criteriaList.add(Criteria.where("priority").is(filter.getPriority()));
      }

      if (filter.getLocation() != null && !filter.getLocation().isEmpty()) {
        criteriaList.add(Criteria.where("location").regex(filter.getLocation(), "i"));
      }

      if (filter.getApproximateAge() != null && !filter.getApproximateAge().isEmpty()) {
        criteriaList.add(Criteria.where("approximateAge").is(filter.getApproximateAge()));
      }

      if (filter.getGender() != null && !filter.getGender().isEmpty()) { 
        criteriaList.add(Criteria.where("gender").is(filter.getGender()));
      }

      if (filter.getEmergency() != null) {
        criteriaList.add(Criteria.where("emergency").is(filter.getEmergency()));
      }

      if (filter.getStartDate() != null && filter.getEndDate() != null) { 
        criteriaList.add(Criteria.where("incidentDate").gte(filter.getStartDate()).lte(filter.getEndDate()));
      } else if (filter.getStartDate() != null) {
        criteriaList.add(Criteria.where("incidentDate").gte(filter.getStartDate()));
      } else if (filter.getEndDate() != null) {
        criteriaList.add(Criteria.where("incidentDate").lte(filter.getEndDate()));
      }
     
      if (filter.getAssignedOfficerId() != null && !filter.getAssignedOfficerId().isEmpty()) {
        criteriaList.add(Criteria.where("assignedOfficerId").is(filter.getAssignedOfficerId()));
      }

      if (filter.getAssignedWorkerId() != null && !filter.getAssignedWorkerId().isEmpty()) {
        criteriaList.add(Criteria.where("assignedWorkerId").is(filter.getAssignedWorkerId()));
      }
      
      if (filter.getReporterUserId() != null && !filter.getReporterUserId().isEmpty()) {
        criteriaList.add(Criteria.where("reporterUserId").is(filter.getReporterUserId()));
      }

      if (filter.getAnonymous() != null) { 
        criteriaList.add(Criteria.where("anonymous").is(filter.getAnonymous()));
      }

      if (!criteriaList.isEmpty()) {
        Criteria[] criteriaArray = criteriaList.toArray(new Criteria[0]); 
        query.addCriteria(new Criteria().andOperator(criteriaArray));
      }
      
    query.with(pageable);
    List<Case> cases = mongoTemplate.find(query, Case.class); 
    long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Case.class);
      Page<Case> casesPage = PageableExecutionUtils.getPage( cases, pageable, () -> total);
      String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
      Role userRole = getUserRole(currentUserId);
      Page<CaseDTO> dtoPage = casesPage.map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId));
      PaginationDTO<CaseDTO> paginationDTO = new PaginationDTO<>();
      paginationDTO.setContent(dtoPage.getContent());
      paginationDTO.setTotalElements(dtoPage.getTotalElements());
      paginationDTO.setTotalPages(dtoPage.getTotalPages());
      paginationDTO.setPage(dtoPage.getNumber());
      paginationDTO.setSize(dtoPage.getSize());
      paginationDTO.setFirst(dtoPage.isFirst());
      paginationDTO.setLast(dtoPage.isLast());
      paginationDTO.setHasNext(dtoPage.hasNext());
      paginationDTO.setHasPrevious(dtoPage.hasPrevious());
      return paginationDTO;
    }
    @Override
    public PaginationDTO<HelpRequestDTO> searchHelpRequests(
      HelpRequestSearchFilterDTO filter, Pageable pageable) { 
      Query query = new Query();
      List<Criteria> criteriaList = new ArrayList<>(); 
      query.with(pageable);
      List<HelpRequest> helpRequests = mongoTemplate.find(query, HelpRequest.class);
      long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), HelpRequest.class);
      Page<HelpRequest> helpRequestsPage = PageableExecutionUtils.getPage( helpRequests, pageable, () -> total);
      String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
      Page<HelpRequestDTO> dtoPage = helpRequestsPage.map(helpRequest -> { 
        HelpRequestDTO dto = new HelpRequestDTO(); 
        return dto;
      });
      PaginationDTO<HelpRequestDTO> paginationDTO = new PaginationDTO<>();
      paginationDTO.setContent(dtoPage.getContent());
      paginationDTO.setTotalElements(dtoPage.getTotalElements());
      paginationDTO.setTotalPages(dtoPage.getTotalPages());
      paginationDTO.setPage(dtoPage.getNumber());
      paginationDTO.setSize(dtoPage.getSize());
      paginationDTO.setFirst(dtoPage.isFirst());
      paginationDTO.setLast(dtoPage.isLast());
      paginationDTO.setHasNext(dtoPage.hasNext());
      paginationDTO.setHasPrevious(dtoPage.hasPrevious());
      return paginationDTO;
    }
    
    @Override
    public PaginationDTO<UserDTO> searchUsers(UserSearchFilterDTO filter, Pageable pageable) {
      Query query = new Query();
      List<Criteria> criteriaList = new ArrayList<>();
      
      if (filter != null) {
        if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
          criteriaList.add(new Criteria().orOperator(
            Criteria.where("fullName").regex(filter.getKeyword(), "i"),
            Criteria.where("email").regex(filter.getKeyword(), "i")
          ));
        }
        
        if (filter.getRole() != null) {
          criteriaList.add(Criteria.where("role").is(filter.getRole()));
        }
      }
      
      if (!criteriaList.isEmpty()) {
        query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
      }
      
      query.with(pageable);
      List<User> users = mongoTemplate.find(query, User.class);
      long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), User.class);
      Page<User> usersPage = PageableExecutionUtils.getPage(users, pageable, () -> total);
      
      Page<UserDTO> dtoPage = usersPage.map(user -> {
        UserDTO dto = new UserDTO();
        return dto;
      });
      
      PaginationDTO<UserDTO> paginationDTO = new PaginationDTO<>();
      paginationDTO.setContent(dtoPage.getContent());
      paginationDTO.setTotalElements(dtoPage.getTotalElements());
      paginationDTO.setTotalPages(dtoPage.getTotalPages());
      paginationDTO.setPage(dtoPage.getNumber());
      paginationDTO.setSize(dtoPage.getSize());
      paginationDTO.setFirst(dtoPage.isFirst());
      paginationDTO.setLast(dtoPage.isLast());
      paginationDTO.setHasNext(dtoPage.hasNext());
      paginationDTO.setHasPrevious(dtoPage.hasPrevious());
      return paginationDTO;
    }
    
    private Role getUserRole(String userId) {
        return userRepository.findById(userId)
            .map(User::getRole)
            .orElse(Role.PU);
    } 
}
