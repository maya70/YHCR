function build_patient_records(comorbids, ancestry){
  var pdata = {};
  for(var c = 0; c < comorbids.length; c++){
    if(!pdata[comorbids[c]['person_id']]){
      pdata[comorbids[c]['person_id']]={};
      pdata[comorbids[c]['person_id']]['age']= comorbids[c]['Age'];
      pdata[comorbids[c]['person_id']]['sex']= comorbids[c]['gender_source_value'];
      pdata[comorbids[c]['person_id']]['condition_ids']= [];
      pdata[comorbids[c]['person_id']]['condition_names']= [];
      pdata[comorbids[c]['person_id']]['condition_names_at_4']= [];
      pdata[comorbids[c]['person_id']]['condition_names_at_8']= [];
      pdata[comorbids[c]['person_id']]['condition_names_at_12']= [];
    }
    if((pdata[comorbids[c]['person_id']]['condition_ids']).indexOf(comorbids[c]['condition_concept_id']) <0){
          // add a new condition for this patient
          pdata[comorbids[c]['person_id']]['condition_ids'].push(comorbids[c]['condition_concept_id']);
          pdata[comorbids[c]['person_id']]['condition_names'].push(comorbids[c]['concept_name']);
          // find the concept ancestors by looking up its ancestry
          var concept_id = comorbids[c]['condition_concept_id'];
          var a_entry = ancestry[concept_id];
          //if(!a_entry)
           // console.log(concept_id);
          var ancestor_at_4 = (a_entry)? ancestry[concept_id][0]['name'] : 'NA';
          var ancestor_at_8 = (a_entry)? ancestry[concept_id][1]['name'] : 'NA';
          var ancestor_at_12 = (a_entry)? ancestry[concept_id][2]['name'] : 'NA';
           pdata[comorbids[c]['person_id']]['condition_names_at_4'].push(ancestor_at_4);
           pdata[comorbids[c]['person_id']]['condition_names_at_8'].push(ancestor_at_8);
           pdata[comorbids[c]['person_id']]['condition_names_at_12'].push(ancestor_at_12);
           // keep a global record of unique condition names
           conditions_at_0[comorbids[c]['concept_name']] =0;
           conditions_at_4[ancestor_at_4] =0;
           conditions_at_8[ancestor_at_8] =0;
           conditions_at_12[ancestor_at_12] = 0; 
    }
  }
  return pdata;
}

function create_dimensions(comorbids, ancestry, sepLevel){
  var table = {};
  //var condition_names_idx = 'condition_names';
  var unique_conditions = (sepLevel ===0)? conditions_at_0: ((sepLevel===4)? conditions_at_4: (sepLevel===8)? conditions_at_8: conditions_at_12);
  
  for(var c = 0; c < comorbids.length; c++){
     var concept_id = comorbids[c]['condition_concept_id'];
     var a_entry = ancestry[concept_id];
     var ancestor_at_4 = (a_entry)? (ancestry[concept_id]['4']? ancestry[concept_id]['4']: 'NA') : 'NA';
     var ancestor_at_8 = (a_entry)? (ancestry[concept_id]['8']? ancestry[concept_id]['8']: 'NA') : 'NA';
     var ancestor_at_12 = (a_entry)? (ancestry[concept_id]['12']? ancestry[concept_id]['12']: 'NA') : 'NA';
     conditions_at_0[comorbids[c]['concept_name']] = 0;
     conditions_at_4[ancestor_at_4] = 0;
     conditions_at_8[ancestor_at_8] = 0;
     conditions_at_12[ancestor_at_12]=0;       
  }
  
  for(var c = 0; c < comorbids.length; c++){
    var person_id = comorbids[c]['person_id'];
     
    if(!table[person_id]) { 
        var tmp = {};
        tmp['person_id'] = person_id;
        tmp['age'] = comorbids[c]['Age'];
        tmp['sex'] = comorbids[c]['gender_source_value'];
        for(var key in unique_conditions){
          tmp[key] = 0;
        }  
        // get the ancestor for the current condition
        var concept_id = comorbids[c]['condition_concept_id'];
        var a_entry = ancestry[concept_id];
        //console.log(a_entry);
        var condition_has_ancestor =0;
        while (!condition_has_ancestor && sepLevel >=0){
                if(a_entry && a_entry[sepLevel] && a_entry[sepLevel]!== 'NA')
                  {condition_has_ancestor = 1; break;}
                else {console.log(concept_id + ' at ' + sepLevel +' has ancestry = ' + a_entry); }

                sepLevel -=4; 
        }
        var condition = (condition_has_ancestor)? a_entry[sepLevel]: comorbids[c]['concept_name'];
        unique_conditions[condition] = (unique_conditions[condition])? unique_conditions[condition]+1: 1;
        tmp[condition] = unique_conditions[condition]; 
        table[person_id] = tmp;
       } 
   else {//patient record already exists, just add the condition 
        var concept_id = comorbids[c]['condition_concept_id'];
        var a_entry = ancestry[concept_id];
        var condition_has_ancestor =0;
        while (!condition_has_ancestor && sepLevel >=0){
    
            if(a_entry && a_entry[sepLevel] && a_entry[sepLevel]!== 'NA')
              {condition_has_ancestor = 1; break;}
            sepLevel -= 4;
            }
        var condition = (condition_has_ancestor)? a_entry[sepLevel]: comorbids[c]['concept_name'];
        unique_conditions[condition] = (unique_conditions[condition])? unique_conditions[condition]+1: 1;      
        table[person_id][condition] = unique_conditions[condition];
        }
  }

  // final pass
  var arr = [];
  for(var row in table){
    for(var key in unique_conditions){
      if(!table[row][key])
        table[row][key] = 0; 
      
    }
    arr.push(table[row]);
  }
  return arr;
}

function build_ancestry(lineage){
  var ancestry = {};
  for(var l=0; l<lineage.length; l++){
    if(!ancestry[lineage[l]['descendant_concept_id']]){
      ancestry[lineage[l]['descendant_concept_id']]= {};
      ancestry[lineage[l]['descendant_concept_id']]['0'] = 'NA';
      ancestry[lineage[l]['descendant_concept_id']]['4'] = 'NA';
      ancestry[lineage[l]['descendant_concept_id']]['8'] = 'NA';
      ancestry[lineage[l]['descendant_concept_id']]['12'] = 'NA';
      
    }
    var seplevel = lineage[l]['max_levels_of_separation'];
    //var idx = (seplevel > 0? (seplevel-4)/4: -1);
    //if(idx >=0){
      ancestry[lineage[l]['descendant_concept_id']][seplevel] = lineage[l]['concept_name']; 
    //}
  }
  return ancestry;
}











console.log(lineage.length);
  d3.csv("./data/t2dcomorbids.csv", function(comorbids) {
      console.log(comorbids);

 var ancestry = build_ancestry(lineage);
 //var precs = build_patient_records(comorbids, ancestry);
 var sepLevel = 12;
 var table = create_dimensions(comorbids, ancestry,sepLevel);
 console.log(table);
 data = table;
 