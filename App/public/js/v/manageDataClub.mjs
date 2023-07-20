
// if (formUpEl["clubId"].checkValidity() && formUpEl["clubId"].value) {
//   const clubRec = await Club.retrieve( formUpEl["clubId"].value);
//   formUpEl["clubId"].value = clubRec.clubId;
//   formUpEl["name"].value = clubRec.name;
//   formUpEl["status"].value = clubRec.status;
//   formUpEl["description"].value = clubRec.description;
//   formUpEl["contactInfo"].value = clubRec.contactInfo;
//   formUpEl["startDate"].value = clubRec.startDate;
//   formUpEl["endDate"].value = clubRec.endDate;
//   formUpEl["daysInWeek"].value = clubRec.daysInWeek;
//   if (clubRec.chair_id) formUpEl["chair"].value = clubRec.chair_id;
//   updateTrainerWidget.innerHTML = "";
//   await createMultiSelectionWidget (formUpEl, clubRec.trainerIdRefs,
//     "trainers", "id", "trainerId",
//     Staff.checkTrainerIdAsIdRef, Trainer.retrieve);
// } else {
//   formUpEl.reset();
// }