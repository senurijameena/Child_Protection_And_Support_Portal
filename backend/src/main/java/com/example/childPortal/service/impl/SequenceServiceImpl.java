package com.example.childPortal.service.impl;

import com.example.childPortal.model.Sequence;
import com.example.childPortal.service.SequenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;
import static org.springframework.data.mongodb.core.query.Criteria.where;

@Service
public class SequenceServiceImpl implements SequenceService {

    @Autowired
    private MongoOperations mongoOperations;

    @Override
    public long getNextSequence(String sequenceName) {
        Query query = new Query(where("_id").is(sequenceName));
        Update update = new Update().inc("seq", 1);
        Sequence sequence = mongoOperations.findAndModify(
            query,
            update,
            options().returnNew(true).upsert(true),
            Sequence.class
        );
        return sequence != null ? sequence.getSeq() : 1;
    }
}

