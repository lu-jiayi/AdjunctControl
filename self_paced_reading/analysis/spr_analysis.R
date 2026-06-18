this.dir <- dirname(rstudioapi::getSourceEditorContext()$path)
setwd(this.dir)

library(plyr)
library(dplyr)
library(reshape)
library(ggplot2)
library(gtable)
library(lme4)
library(tidyverse)
library(lmerTest)
library(bootstrap)
library(ggpubr)
library(stringr)
library(brms)
library(BayesFactor)

`%notin%` <- Negate(`%in%`)
raw_data_path <- "data_batch1.csv"
data<-read.csv(raw_data_path)
critical_data <- data %>%
  filter(type == "critical") %>%
  group_by(workerid, trial_id, trial_no) %>%
  mutate(
    critical_idx = word_idx[region == "critical"][1],
    
    condition_voice = if_else(
      any(region == "spillover_2" & form == "be", na.rm = TRUE),
      "passive",
      "active"
    ),
    
    condition_pronoun = if_else(
      any(form == "that" & word_idx < critical_idx, na.rm = TRUE),
      "yes",
      "no"
    )
  ) %>%
  select(-critical_idx) %>%
  ungroup()


roi_data <- critical_data %>%
  filter(region != 0)

roi_summary <- roi_data %>%
  group_by(region, condition_voice, condition_pronoun) %>%
  summarise(
    Mean = mean(rt, na.rm = TRUE),
    CILow = Mean - ci.low(rt),
    CIHigh = Mean + ci.high(rt),
    .groups = "drop"
  )
